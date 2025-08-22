/* global React, ReactDOM */

const { useEffect, useMemo, useRef, useState } = React;

// Utilities
const debounce = (fn, ms) => {
	let handle;
	return (...args) => {
		clearTimeout(handle);
		handle = setTimeout(() => fn(...args), ms);
	};
};

const TMDB = {
	apiKey: () => (window.__TMDB_CONFIG__?.apiKey || ''),
	apiBase: () => (window.__TMDB_CONFIG__?.apiBase || 'https://api.themoviedb.org/3'),
	imageBase: () => (window.__TMDB_CONFIG__?.imageBase || 'https://image.tmdb.org/t/p'),
	buildUrl: (path, params = {}) => {
		const url = new URL(`${TMDB.apiBase()}${path}`);
		url.searchParams.set('api_key', TMDB.apiKey());
		for (const [k, v] of Object.entries(params)) {
			if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
		}
		return url.toString();
	}
};

// Local storage helpers
const FAVORITES_KEY = 'movie_favorites_v1';
const loadFavorites = () => {
	try {
		const raw = localStorage.getItem(FAVORITES_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch { return []; }
};
const saveFavorites = (ids) => {
	try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids)); } catch {}
};

// Components
function StarRating({ value }) {
	const full = Math.round((value || 0) / 2); // TMDB 0-10 -> 0-5 stars
	return (
		<div className="flex items-center gap-0.5" aria-label={`Rating ${value} out of 10`}>
			{Array.from({ length: 5 }).map((_, i) => (
				<svg key={i} className={`w-4 h-4 ${i < full ? 'text-yellow-400' : 'text-gray-400 dark:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
					<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.802-2.036a1 1 0 00-1.175 0L6.206 16.28c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.57 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
				</svg>
			))}
		</div>
	);
}

function MovieCard({ movie, imageBase, isFavorite, onToggleFavorite }) {
	const posterUrl = movie.poster_path ? `${imageBase}/w342${movie.poster_path}` : null;
	const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '—';
	const overview = movie.overview || 'No description available.';
	const downloadHref = movie.homepage || (movie.id ? `https://www.themoviedb.org/movie/${movie.id}` : '#');
	return (
		<div className="group rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
			<div className="relative aspect-[2/3] overflow-hidden">
				{posterUrl ? (
					<img src={posterUrl} alt={`${movie.title} poster`} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"/>
				) : (
					<div className="h-full w-full bg-gray-200 dark:bg-gray-700 grid place-content-center text-gray-400">No Image</div>
				)}
				<button className="absolute top-2 right-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow p-2" aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'} onClick={() => onToggleFavorite(movie.id)}>
					<svg className={`w-5 h-5 ${isFavorite ? 'text-rose-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/></svg>
				</button>
			</div>
			<div className="p-4 flex flex-col gap-2">
				<div className="flex items-start justify-between gap-2">
					<div>
						<h3 className="text-base font-semibold line-clamp-2" title={movie.title}>{movie.title}</h3>
						<p className="text-sm text-gray-500 dark:text-gray-400">{year}</p>
					</div>
					<StarRating value={movie.vote_average} />
				</div>
				<p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{overview}</p>
				<div className="flex items-center gap-2 mt-2">
					<a className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-brand text-white hover:bg-brand-dark transition" href={downloadHref} target="_blank" rel="noopener noreferrer" aria-label={`Open ${movie.title} details`}>
						<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 3a2 2 0 012-2h4a1 1 0 010 2H5v12h10V9a1 1 0 112 0v7a2 2 0 01-2 2H5a2 2 0 01-2-2V3z"/><path d="M17 2a1 1 0 00-1-1h-4a1 1 0 100 2h1.586L9.293 6.293a1 1 0 001.414 1.414L15 4.414V6a1 1 0 102 0V2z"/></svg>
						<span>Download</span>
					</a>
				</div>
			</div>
		</div>
	);
}

function useGenres() {
	const [genres, setGenres] = useState([]);
	useEffect(() => {
		if (!TMDB.apiKey()) return;
		fetch(TMDB.buildUrl('/genre/movie/list', { language: 'en-US' }))
			.then(r => r.json())
			.then(d => setGenres(d.genres || []))
			.catch(() => setGenres([]));
	}, []);
	return genres;
}

function useLanguages() {
	const [langs, setLangs] = useState([]);
	useEffect(() => {
		// Use TMDB configuration languages endpoint
		if (!TMDB.apiKey()) return;
		fetch(TMDB.buildUrl('/configuration/languages'))
			.then(r => r.json())
			.then(d => setLangs(Array.isArray(d) ? d : []))
			.catch(() => setLangs([]));
	}, []);
	return langs;
}

function Header({ query, setQuery, onClear, onToggleDark, darkMode, suggestions, onSelectSuggestion }) {
	return (
		<header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
				<h1 className="text-xl font-bold">Movie Finder</h1>
				<div className="relative flex-1">
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search movies..."
						className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-brand"
						role="searchbox"
						aria-label="Search movies"
					/>
					{query && (
						<button aria-label="Clear search" onClick={onClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
							&times;
						</button>
					)}
					{suggestions.length > 0 && (
						<ul className="absolute mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-auto">
							{suggestions.map(s => (
								<li key={s.id}>
									<button
										onClick={() => onSelectSuggestion(s)}
										className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										{s.title}
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
				<button onClick={onToggleDark} className="ml-auto rounded-lg border px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800" aria-label="Toggle dark mode">
					{darkMode ? 'Light' : 'Dark'}
				</button>
			</div>
		</header>
	);
}

function Filters({ isOpen, setIsOpen, genres, year, setYear, selectedGenres, setSelectedGenres, language, setLanguage, rating, setRating, sortBy, setSortBy }) {
	const years = useMemo(() => {
		const current = new Date().getFullYear();
		return Array.from({ length: 100 }).map((_, i) => String(current - i));
	}, []);
	return (
		<div className="border-b border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2">
				<button className="lg:hidden rounded-lg border px-3 py-2" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls="filter-panel">Filters</button>
				<div id="filter-panel" className={`grid grid-cols-1 lg:grid-cols-5 gap-2 w-full ${isOpen ? '' : 'hidden lg:grid'}`}>
					<div className="flex flex-col gap-1">
						<label className="text-sm text-gray-600 dark:text-gray-300">Genre</label>
						<select multiple value={selectedGenres} onChange={(e) => setSelectedGenres(Array.from(e.target.selectedOptions).map(o => o.value))} className="rounded-lg border bg-white/90 dark:bg-gray-800/90 p-2 h-28" aria-label="Filter by genre">
							{genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
						</select>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-sm text-gray-600 dark:text-gray-300">Year</label>
						<select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-lg border bg-white/90 dark:bg-gray-800/90 p-2" aria-label="Filter by year">
							<option value="">Any</option>
							{years.map(y => <option key={y} value={y}>{y}</option>)}
						</select>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-sm text-gray-600 dark:text-gray-300">Language</label>
						<select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-lg border bg-white/90 dark:bg-gray-800/90 p-2" aria-label="Filter by language">
							<option value="">Any</option>
							<option value="en">English</option>
							<option value="es">Spanish</option>
							<option value="fr">French</option>
							<option value="de">German</option>
							<option value="hi">Hindi</option>
							<option value="zh">Chinese</option>
						</select>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-sm text-gray-600 dark:text-gray-300">Rating</label>
						<select value={rating} onChange={(e) => setRating(e.target.value)} className="rounded-lg border bg-white/90 dark:bg-gray-800/90 p-2" aria-label="Filter by rating">
							<option value="">Any</option>
							{[9,8,7,6,5].map(r => <option key={r} value={r}>{r}+ / 10</option>)}
						</select>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-sm text-gray-600 dark:text-gray-300">Sort by</label>
						<select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border bg-white/90 dark:bg-gray-800/90 p-2" aria-label="Sort options">
							<option value="popularity.desc">Popularity</option>
							<option value="release_date.desc">Release Date</option>
							<option value="original_title.asc">A-Z</option>
							<option value="vote_average.desc">Rating</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	);
}

function useInfiniteScroll(callback) {
	const sentinelRef = useRef(null);
	useEffect(() => {
		const target = sentinelRef.current;
		if (!target) return;
		const observer = new IntersectionObserver((entries) => {
			if (entries.some(e => e.isIntersecting)) callback();
		}, { rootMargin: '300px' });
		observer.observe(target);
		return () => observer.disconnect();
	}, [callback]);
	return sentinelRef;
}

function App() {
	const [darkMode, setDarkMode] = useState(false);
	const [query, setQuery] = useState('');
	const [suggestions, setSuggestions] = useState([]);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [selectedGenres, setSelectedGenres] = useState([]);
	const [year, setYear] = useState('');
	const [language, setLanguage] = useState('');
	const [rating, setRating] = useState('');
	const [sortBy, setSortBy] = useState('popularity.desc');
	const [page, setPage] = useState(1);
	const [results, setResults] = useState([]);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [favorites, setFavorites] = useState(loadFavorites());

	const genres = useGenres();
	const languages = useLanguages();

	useEffect(() => {
		document.documentElement.classList.toggle('dark', darkMode);
	}, [darkMode]);

	const performSearch = async ({ append = false, pageOverride } = {}) => {
		if (!TMDB.apiKey()) {
			setError('Add your TMDb API key in tmdb.config.js');
			return;
		}
		setIsLoading(true);
		setError('');
		const params = {
			query: query || undefined,
			with_genres: selectedGenres.join(',') || undefined,
			primary_release_year: year || undefined,
			with_original_language: language || undefined,
			'sort_by': sortBy,
			'vote_average.gte': rating || undefined,
			page: pageOverride || page,
			include_adult: false,
			language: 'en-US'
		};
		const path = query ? '/search/movie' : '/discover/movie';
		try {
			const url = TMDB.buildUrl(path, params);
			const res = await fetch(url);
			if (!res.ok) throw new Error('Failed to fetch');
			const data = await res.json();
			setTotalPages(data.total_pages || 1);
			setResults(prev => append ? [...prev, ...(data.results || [])] : (data.results || []));
		} catch (e) {
			setError('Something went wrong. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	// Debounced suggestions
	const updateSuggestions = useMemo(() => debounce(async (q) => {
		if (!q) { setSuggestions([]); return; }
		if (!TMDB.apiKey()) return;
		try {
			const url = TMDB.buildUrl('/search/movie', { query: q, page: 1 });
			const res = await fetch(url);
			const data = await res.json();
			setSuggestions((data.results || []).slice(0, 8));
		} catch {}
	}, 250), []);

	useEffect(() => { updateSuggestions(query); }, [query, updateSuggestions]);

	// Re-run search when filters/sort change
	useEffect(() => {
		setPage(1);
		performSearch({ append: false, pageOverride: 1 });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [query, selectedGenres.join(','), year, language, rating, sortBy]);

	const onLoadMore = () => {
		if (page >= totalPages || isLoading) return;
		const next = page + 1;
		setPage(next);
		performSearch({ append: true, pageOverride: next });
	};
	const sentinelRef = useInfiniteScroll(onLoadMore);

	const toggleFavorite = (id) => {
		setFavorites((prev) => {
			const exists = prev.includes(id);
			const next = exists ? prev.filter(x => x !== id) : [...prev, id];
			saveFavorites(next);
			return next;
		});
	};

	return (
		<div className="min-h-full">
			<Header
				query={query}
				setQuery={setQuery}
				onClear={() => setQuery('')}
				onToggleDark={() => setDarkMode(d => !d)}
				darkMode={darkMode}
				suggestions={suggestions}
				onSelectSuggestion={(m) => { setQuery(m.title); setSuggestions([]); }}
			/>

			<Filters
				isOpen={isFilterOpen}
				setIsOpen={setIsFilterOpen}
				genres={genres}
				year={year}
				setYear={setYear}
				selectedGenres={selectedGenres}
				setSelectedGenres={setSelectedGenres}
				language={language}
				setLanguage={setLanguage}
				rating={rating}
				setRating={setRating}
				sortBy={sortBy}
				setSortBy={setSortBy}
			/>

			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
				{error && (
					<div className="mb-4 rounded-lg border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/40 text-rose-700 dark:text-rose-200 p-3">
						{error}
					</div>
				)}

				{isLoading && results.length === 0 ? (
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
						{Array.from({ length: 10 }).map((_, i) => (
							<div key={i} className="animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 h-80" />
						))}
					</div>
				) : results.length === 0 ? (
					<div className="text-center text-gray-600 dark:text-gray-300">No results found. Try a different search.</div>
				) : (
					<>
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
							{results.map(m => (
								<MovieCard key={m.id} movie={m} imageBase={TMDB.imageBase()} isFavorite={favorites.includes(m.id)} onToggleFavorite={toggleFavorite} />
							))}
						</div>

						<div className="flex items-center justify-center gap-3 mt-6">
							<button onClick={onLoadMore} disabled={isLoading || page >= totalPages} className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
								{isLoading ? 'Loading...' : (page < totalPages ? 'Load More' : 'No more results')}
							</button>
						</div>
					</>
				)}

				<div ref={sentinelRef} aria-hidden="true" />
			</main>
		</div>
	);
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);