import Icon from '../components/Icon.jsx';
import { Seo } from '../context/HeadContext.jsx';
import { useData } from '../context/DataContext.jsx';

export default function About() {
    const { profile } = useData();

    const summary = profile?.summary ?? [];
    const highlights = Object.entries(profile?.highlights ?? {});
    const skills = Object.entries(profile?.skills ?? {});
    const experience = profile?.experience ?? [];
    const education = profile?.education ?? [];
    const certifications = profile?.certifications ?? [];

    return (
        <>
            <Seo
                title={`About — ${profile?.name ?? ''}`}
                description={profile?.headline ?? ''}
                canonical="/about"
            />

            <section className="page-hero">
                <div className="container">
                    <span className="eyebrow">About</span>
                    <h1 className="page-title">{profile?.name ?? ''}</h1>
                    <p className="page-lead">{profile?.headline ?? ''}</p>
                </div>
            </section>

            <section className="section">
                <div className="container prose">
                    {summary.map((paragraph) => (
                        <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                    ))}
                </div>
            </section>

            <section className="section section-alt">
                <div className="container">
                    <header className="section-head">
                        <span className="eyebrow">Experience</span>
                        <h2 className="section-title">Work history</h2>
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

            <section className="section">
                <div className="container">
                    <header className="section-head">
                        <span className="eyebrow">What I do</span>
                        <h2 className="section-title">Areas of expertise</h2>
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

            <section className="section section-alt">
                <div className="container">
                    <header className="section-head">
                        <span className="eyebrow">Toolkit</span>
                        <h2 className="section-title">Skills</h2>
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

            <section className="section">
                <div className="container">
                    <div className="grid grid-2">
                        <div>
                            <header className="section-head">
                                <span className="eyebrow">Education</span>
                                <h2 className="section-title">Qualifications</h2>
                            </header>

                            <div className="grid grid-1">
                                {education.map((item) => (
                                    <article className="card" key={item.degree}>
                                        <h3>{item.degree}</h3>
                                        <p className="muted">{item.institution}</p>
                                        <p className="muted">
                                            {item.period} &middot; {item.score}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div>
                            <header className="section-head">
                                <span className="eyebrow">Credentials</span>
                                <h2 className="section-title">Certifications &amp; training</h2>
                            </header>

                            <div className="grid grid-1">
                                {certifications.map((item) => (
                                    <article className="card cert-card" key={item.title}>
                                        <div className="cert-icon" aria-hidden="true">
                                            <Icon name="star" />
                                        </div>
                                        <div>
                                            <h3>{item.title}</h3>
                                            <p className="muted">
                                                {item.issuer} &middot; {item.year}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
