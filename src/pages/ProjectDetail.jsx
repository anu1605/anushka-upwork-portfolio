import { Link, useParams } from 'react-router-dom';

import Icon from '../components/Icon.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { Seo } from '../context/HeadContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { lines, paragraphs, techList } from '../lib/format.js';
import NotFound from './NotFound.jsx';

export default function ProjectDetail() {
    const { slug } = useParams();
    const { profile, projects } = useData();

    const project = projects.find((item) => item.slug === slug);

    if (!project) {
        return <NotFound />;
    }

    const tech = techList(project);
    const body = paragraphs(project.description);
    const highlights = lines(project.highlights);

    const related = projects
        .filter((item) => item.slug !== project.slug)
        .filter((item) => (project.category ? item.category === project.category : true))
        .slice(0, 3);

    return (
        <article className="project-detail">
            <Seo
                title={`${project.title} — ${profile?.name ?? ''}`}
                description={project.summary}
                canonical={`/projects/${project.slug}`}
            />

            <section className="page-hero">
                <div className="container">
                    <nav className="breadcrumb" aria-label="Breadcrumb">
                        <Link to="/projects">Projects</Link>
                        <span aria-hidden="true">/</span>
                        <span>{project.category}</span>
                    </nav>

                    <h1 className="page-title">{project.title}</h1>
                    <p className="page-lead">{project.summary}</p>

                    <div className="project-detail-meta">
                        {project.client ? (
                            <div>
                                <span className="muted">Client</span>
                                <strong>{project.client}</strong>
                            </div>
                        ) : null}
                        {project.role ? (
                            <div>
                                <span className="muted">Role</span>
                                <strong>{project.role}</strong>
                            </div>
                        ) : null}
                        {project.year ? (
                            <div>
                                <span className="muted">Period</span>
                                <strong>{project.year}</strong>
                            </div>
                        ) : null}
                        {project.category ? (
                            <div>
                                <span className="muted">Category</span>
                                <strong>{project.category}</strong>
                            </div>
                        ) : null}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="project-detail-layout">
                        <div className="prose">
                            {body.map((paragraph) => (
                                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                            ))}

                            {highlights.length > 0 ? (
                                <>
                                    <h2>What was delivered</h2>
                                    <ul className="check-list">
                                        {highlights.map((highlight) => (
                                            <li key={highlight.slice(0, 32)}>
                                                <Icon name="check" />
                                                <span>{highlight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : null}
                        </div>

                        <aside className="project-detail-aside">
                            <div className="card">
                                <h2 className="aside-title">Stack</h2>
                                <ul className="tag-list">
                                    {tech.map((item) => (
                                        <li className="tag" key={item}>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {project.demo_url || project.repo_url ? (
                                <div className="card">
                                    <h2 className="aside-title">Links</h2>
                                    {project.demo_url ? (
                                        <a
                                            className="btn btn-primary btn-block"
                                            href={project.demo_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Live project
                                        </a>
                                    ) : null}
                                    {project.repo_url ? (
                                        <a
                                            className="btn btn-ghost btn-block"
                                            href={project.repo_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Source code
                                        </a>
                                    ) : null}
                                </div>
                            ) : null}

                            <div className="card">
                                <h2 className="aside-title">Need something similar?</h2>
                                <p className="muted">I build payment, marketplace and integration systems for a living.</p>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {related.length > 0 ? (
                <section className="section section-alt">
                    <div className="container">
                        <header className="section-head section-head-row">
                            <div>
                                <span className="eyebrow">Keep reading</span>
                                <h2 className="section-title">Related projects</h2>
                            </div>
                            <Link className="btn btn-ghost" to="/projects">
                                All projects
                            </Link>
                        </header>

                        <div className="grid grid-3">
                            {related.map((item) => (
                                <ProjectCard project={item} compact key={item.id} />
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}
        </article>
    );
}
