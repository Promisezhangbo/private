import { BankOutlined, BookOutlined, CodeOutlined, ProjectOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Divider, Typography, message } from 'antd';
import {
  education,
  profile,
  projects,
  selfEvaluation,
  skills,
  workExperience,
  type ResumeProject,
} from '@/data/resumeContent';
import { parseProjectCard } from '@/utils/parseProjectCard';
import { downloadResumePublicPdf } from '@/utils/downloadResumePublicPdf';
import React, { useState, type ReactElement } from 'react';
import './index.scss';

const { Title, Paragraph, Text, Link } = Typography;

const PANEL = { className: 'dash-panel dash-panel--full', variant: 'outlined' as const };

function panel(extraClass?: string) {
  return { ...PANEL, className: extraClass ? `${PANEL.className} ${extraClass}` : PANEL.className };
}

function sectionTitle(icon: ReactElement, text: string) {
  return (
    <span className="resume-card-head-title">
      <span className="resume-card-head-title__icon" aria-hidden>
        {icon}
      </span>
      <span className="resume-card-head-title__text">{text}</span>
    </span>
  );
}

function ProjectExperienceCard({ project }: { project: ResumeProject }) {
  const p = parseProjectCard(project);

  return (
    <article className="resume-project-card-v2">
      <header className="resume-project-card-v2__header">
        <Title level={5} className="resume-project-card-v2__title">
          {project.title}
        </Title>
        {p.primaryLink ? (
          <a
            className="resume-project-card-v2__demo"
            href={p.primaryLink.href}
            target="_blank"
            rel="noopener noreferrer"
            title={p.primaryLink.text}
          >
            <span className="resume-project-card-v2__demo-icon" aria-hidden>
              ↗
            </span>
            在线体验
          </a>
        ) : null}
      </header>

      {p.stackTags.length > 0 ? (
        <div className="resume-project-card-v2__tags">
          {p.stackTags.map((tag) => (
            <span key={tag} className="resume-project-card-v2__tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {p.description ? (
        <section className="resume-project-card-v2__desc" aria-label="项目描述">
          <div className="resume-project-card-v2__desc-head">
            <span className="resume-project-card-v2__desc-pill">项目描述</span>
          </div>
          <Paragraph className="resume-project-card-v2__desc-text">{p.description}</Paragraph>
        </section>
      ) : null}

      {p.dutyItems.length > 0 ? (
        <section className="resume-project-card-v2__duties" aria-label={p.dutySectionTitle}>
          <div className="resume-project-card-v2__duties-head">
            <span className="resume-project-card-v2__duties-pill">{p.dutySectionTitle}</span>
          </div>
          <ol className="resume-project-card-v2__duty-list">
            {p.dutyItems.map((text, idx) => (
              <li key={idx} className="resume-project-card-v2__duty-item">
                <span className="resume-project-card-v2__duty-num">{idx + 1}</span>
                <span className="resume-project-card-v2__duty-text">{text}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </article>
  );
}

function ResumeHome() {
  const [exporting, setExporting] = useState(false);

  const handleExportResume = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await downloadResumePublicPdf(`${profile.name}-前端简历.pdf`);
      message.success('已开始下载简历 PDF');
    } catch (err) {
      message.error(err instanceof Error ? err.message : '导出失败，请稍后重试');
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="resume-home-shell" id="resume-print-root">
      <Card className="dash-hero dash-hero--intro" variant="outlined">
        <div className="dash-hero-intro__row">
          <div className="dash-hero-intro__main">
            <Title level={3} className="dash-hero-title">
              {profile.name}
            </Title>
            <Paragraph className="dash-hero-lead">{profile.meta}</Paragraph>
            <Paragraph className="resume-hero-portfolio">
              <Link className="resume-hero-link" href={profile.portfolio} target="_blank" rel="noopener noreferrer">
                {profile.portfolio}
              </Link>
            </Paragraph>
          </div>
          <Button type="default" className="resume-export-pdf-btn" loading={exporting} onClick={handleExportResume}>
            导出简历
          </Button>
        </div>
      </Card>

      <Card {...panel()} title={sectionTitle(<CodeOutlined />, '技术技能')}>
        <ul className="dash-package-list">
          {skills.map((text) => (
            <li key={text}>
              <Paragraph className="dash-package-desc">{text}</Paragraph>
            </li>
          ))}
        </ul>
      </Card>

      <Card {...panel()} title={sectionTitle(<BankOutlined />, '工作经历')}>
        {workExperience.map((job, index) => (
          <React.Fragment key={job.company}>
            {index > 0 ? <Divider className="resume-divider" /> : null}
            <Title level={5} className="resume-project-title">
              {job.company}
            </Title>
            <Text className="resume-work-role">{job.role}</Text>
            <Paragraph className="resume-work-body">{job.summary}</Paragraph>
            <ul className="resume-work-highlight-list" aria-label="工作亮点">
              {job.highlights.map((line) => (
                <li key={line} className="resume-work-highlight-item">
                  {line}
                </li>
              ))}
            </ul>
            <Paragraph className="resume-work-stack">{job.stack}</Paragraph>
          </React.Fragment>
        ))}
      </Card>

      <Card {...panel('resume-projects-panel')} title={sectionTitle(<ProjectOutlined />, '项目经验')}>
        <div className="resume-projects-panel__sheet">
          {projects.map((project) => (
            <ProjectExperienceCard key={project.title} project={project} />
          ))}
        </div>
      </Card>

      <Card {...panel('resume-self-panel')} title={sectionTitle(<UserOutlined />, '自我评价')}>
        <Paragraph className="dash-package-desc">{selfEvaluation}</Paragraph>
      </Card>

      <Card {...panel('resume-edu-card-panel')} title={sectionTitle(<BookOutlined />, '教育经历')}>
        <div className="resume-edu-list">
          {education.map((row) => (
            <article key={row.school} className="resume-edu-card">
              <div className="resume-edu-card__top">
                <Title level={5} className="resume-edu-card__school">
                  {row.school}
                </Title>
                <Text className="resume-edu-card__period">{row.period}</Text>
              </div>
              <div className="resume-edu-card__meta">
                <span className="resume-edu-card__pill">{row.major}</span>
                <span className="resume-edu-card__pill">{row.degree}</span>
              </div>
            </article>
          ))}
        </div>
      </Card>
    </main>
  );
}

export default ResumeHome;
