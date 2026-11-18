import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import ProjectCard from '../components/ProjectCard.jsx';
import { Seo } from '../context/HeadContext.jsx';
import { useData } from '../context/DataContext.jsx';

export default function Projects() {
    const { profile, projects, categories } = useData();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeCategory = searchParams.get('category') ?? 'all';
    const search = searchParams.get('q') ?? '';
    const [query, setQuery] = useState(search);

    const filtered = useMemo(() => {
        const needle = search.trim().toLowerCase();

        return projects.filter((project) => {
            if (activeCategory !== 'all' && project.category !== activeCategory) {
                return false;
            }

            if (needle === '') {
                return true;
            }

            return (
                String(project.title).toLowerCase().includes(needle) ||
                String(project.summary).toLowerCase().includes(needle) ||
                String(project.tech_stack).toLowerCase().includes(needle)
            );
        });
    }, [projects, activeCategory, search]);

    function applyCategory(category) {
        const next = new URLSearchParams(searchParams);

        if (category === 'all') {
            next.delete('category');
        } else {
            next.set('category', category);
        }

        setSearchParams(next);
    }

    function applySearch(event) {
        event.preventDefault();

        const next = new URLSearchParams(searchParams);

        if (query.trim() === '') {
            next.delete('q');
        } else {
            next.set('q', query.trim());
        }

        setSearchParams(next);
    }

    return (
        <>
            <Seo
                title={`Projects — ${profile?.name ?? ''}`}
                description="Production work across payments, marketplace, POS, integrations and performance."
                canonical="/projects"
            />

            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow">Projects</span>
                    <h1 className="page-title">Case studies</h1>
                    <p className="page-lead">
                        Production work across payments, marketplace, POS, integrations and performance &mdash;
                        built with PHP and shipped for international clients.
                    </p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <form className="filter-bar" onSubmit={applySearch}>
                        <div className="filter-chips">
                            <button
                                type="button"
                                className={`chip${activeCategory === 'all' ? ' is-active' : ''}`}
                                onClick={() => applyCategory('all')}
                            >
                                All
                            </button>
                            {categories.map((category) => (
                                <button
                                    type="button"
                                    key={category}
                                    className={`chip${activeCategory === category ? ' is-active' : ''}`}
                                    onClick={() => applyCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <div className="filter-search">
                            <label className="sr-only" htmlFor="project-search">
                                Search projects
                            </label>
                            <input
                                type="search"
                                id="project-search"
                                name="q"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search projects or tech&hellip;"
                            />
                            <button type="submit" className="btn btn-ghost btn-sm">
                                Search
                            </button>
                        </div>
                    </form>

                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <h2>No projects found</h2>
                            <p>Try a different category or clear the search filter.</p>
                            <Link
                                className="btn btn-ghost"
                                to="/projects"
                                onClick={() => {
                                    setQuery('');
                                    setSearchParams(new URLSearchParams());
                                }}
                            >
                                Reset filters
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p className="result-count">
                                {filtered.length} project{filtered.length === 1 ? '' : 's'} shown
                            </p>

                            <div className="grid grid-3">
                                {filtered.map((project) => (
                                    <ProjectCard project={project} key={project.id} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </>
    );
}
