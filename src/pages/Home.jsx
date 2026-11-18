import { Link } from 'react-router-dom';

import Icon from '../components/Icon.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { Seo } from '../context/HeadContext.jsx';
import { useData } from '../context/DataContext.jsx';

export default function Home() {
    const { profile, projects } = useData();

    const featured = projects
        .filter((project) => Number(project.featured) === 1)
        .sort((a, b) => Number(a.sort_order) - Number(b.sort_order) || Number(b.id) - Number(a.id))
        .slice(0, 3);

    const highlights = Object.entries(profile?.highlights ?? {});
    const skills = Object.entries(profile?.skills ?? {});
    const stats = profile?.stats ?? [];
    const experience = profile?.experience ?? [];

    return (
        <>
            <Seo
                title={`${profile?.name ?? ''} — ${profile?.role ?? ''}`}
                description={profile?.headline ?? ''}
            />

            <section className="hero">
                <div className="hero-glow" aria-hidden="true"></div>
                <div className="container hero-inner">
                    <div className="hero-copy">
                        {profile?.availability ? (
                            <div className="hero-badges">
                                <span className="pill pill-success">
                                    <span className="dot"></span>
                                    {profile.availability}
                                </span>
                                <span className="pill pill-success">
                                    <span className="dot"></span>
                                    Immediate Joiner
                                </span>
                            </div>
                        ) : null}

                        <h1 className="hero-title">
                            <span className="hero-greeting">Hi, I&rsquo;m</span>
                            {profile?.name ?? ''}
                            <span className="hero-role">{profile?.role ?? ''}</span>
                        </h1>

                        <p className="hero-headline">{profile?.headline ?? ''}</p>

                        <div className="hero-actions">
                            <Link className="btn btn-primary" to="/projects">
                                View my work
                                <Icon name="arrowRight" />
                            </Link>
                        </div>

                        <dl className="hero-stats">
                            {stats.map((stat) => (
                                <div key={stat.label}>
                                    <dt>{stat.value}</dt>
                                    <dd>{stat.label}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <aside className="hero-card" aria-label="Quick facts">
                        <div className="hero-card-head">
                            <span className="avatar" aria-hidden="true">
                                AT
                            </span>
                            <div>
                                <strong>{profile?.name ?? ''}</strong>
                                <span className="muted">{profile?.location ?? ''}</span>
                            </div>
                        </div>

                        <ul className="hero-card-list">
                            <li>
                                <span className="muted">Experience</span>
                                <span>3+ years</span>
                            </li>
                            <li>
                                <span className="muted">Focus</span>
                                <span>E-commerce &amp; payments</span>
                            </li>
                        </ul>
                    </aside>
                </div>
            </section>

            <section className="section" id="highlights">
                <div className="container">
                    <header className="section-head">
                        <span className="eyebrow">What I build</span>
                        <h2 className="section-title">Domain expertise</h2>
                        <p className="section-lead">
                            Nine areas where I have shipped production code for enterprise e-commerce clients.
                        </p>
                    </header>

                    <div className="grid grid-3">
                        {highlights.map(([area, description]) => (
                            <article className="card highlight-card" key={area}>
                                <h3>{area}</h3>
                                <p>{description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section section-alt" id="work">
                <div className="container">
                    <header className="section-head section-head-row">
                        <div>
                            <span className="eyebrow">Selected work</span>
                            <h2 className="section-title">Featured case studies</h2>
                            <p className="section-lead">
                                Real projects shipped to production for international marketplace and retail clients.
                            </p>
                        </div>
                        <Link className="btn btn-ghost" to="/projects">
                            All projects
                        </Link>
                    </header>

                    {featured.length === 0 ? (
                        <p className="muted">No projects published yet.</p>
                    ) : (
                        <div className="grid grid-3">
                            {featured.map((project) => (
                                <ProjectCard project={project} key={project.id} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="section" id="stack">
                <div className="container">
                    <header className="section-head">
                        <span className="eyebrow">Toolkit</span>
                        <h2 className="section-title">Skills &amp; stack</h2>
                        <p className="section-lead">
                            Day-to-day stack across languages, frameworks, gateways and platform integrations.
                        </p>
                    </header>

                    <div className="grid grid-2">
                        {skills.map(([group, items]) => (
                            <div className="card skill-group" key={group}>
                                <h3>{group}</h3>
                                <ul className="tag-list">
                                    {items.map((skill) => (
                                        <li className="tag" key={skill}>
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section section-alt">
                <div className="container">
                    <header className="section-head">
                        <span className="eyebrow">Experience</span>
                        <h2 className="section-title">Where I&rsquo;ve worked</h2>
                    </header>

                    <ol className="timeline">
                        {experience.map((job) => (
                            <li className="timeline-item" key={`${job.company}-${job.period}`}>
                                <div className="timeline-marker" aria-hidden="true"></div>
                                <div className="card timeline-card">
                                    <p className="timeline-period">{job.period}</p>
                                    <h3>{job.role}</h3>
                                    <p className="muted">
                                        {job.company} &middot; {job.location}
                                    </p>
                                    <p>{job.summary}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        </>
    );
}
