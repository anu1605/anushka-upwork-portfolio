import { Link } from 'react-router-dom';

import { excerpt, initials, techList } from '../lib/format.js';
import Icon from './Icon.jsx';

export default function ProjectCard({ project, compact = false }) {
    const tech = techList(project);
    const limit = compact ? 4 : 6;

    return (
        <article className={`card project-card${compact ? ' is-compact' : ''}`}>
            <div className="project-card-media" data-category={project.category}>
                <span className="project-initials" aria-hidden="true">
                    {initials(project.title)}
                </span>
                {project.category ? <span className="project-badge">{project.category}</span> : null}
            </div>

            <div className="project-card-body">
                <h3 className="project-card-title">
                    <Link to={`/projects/${project.slug}`}>{project.title}</Link>
                </h3>

                <p className="project-card-summary">
                    {compact ? excerpt(project.summary, 110) : project.summary}
                </p>

                {tech.length > 0 ? (
                    <ul className="tag-list">
                        {tech.slice(0, limit).map((item) => (
                            <li className="tag" key={item}>
                                {item}
                            </li>
                        ))}
                    </ul>
                ) : null}

                <div className="project-card-meta">
                    {project.year ? <span className="muted">{project.year}</span> : null}
                    {project.role ? <span className="muted">{project.role}</span> : null}
                </div>

                <Link className="link-arrow" to={`/projects/${project.slug}`}>
                    Read case study
                    <Icon name="arrowRight" />
                </Link>
            </div>
        </article>
    );
}
