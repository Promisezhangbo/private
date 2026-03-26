import { Breadcrumb, Progress, Typography } from "antd";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import "./index.scss";

const SKILLS: { name: string; percent: number }[] = [
  { name: "HTML", percent: 90 },
  { name: "CSS", percent: 90 },
  { name: "JS", percent: 85 },
  { name: "TS", percent: 85 },
  { name: "React", percent: 85 },
  { name: "Git", percent: 80 },
  { name: "Nextjs", percent: 75 },
  { name: "Taro", percent: 70 },
  { name: "Webpack", percent: 70 },
  { name: "Vue2", percent: 65 },
  { name: "Vue3", percent: 65 },
  { name: "Vite", percent: 60 },
  { name: "Umijs", percent: 60 },
  { name: "Jest", percent: 55 },
];

const GREEN = "#52c41a";
const AMBER = "#faad14";

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function SkillHome() {
  const [fills, setFills] = useState<number[]>(() => SKILLS.map(() => 0));

  useEffect(() => {
    const base = 380;
    const timers = SKILLS.map((s, i) =>
      window.setTimeout(
        () => {
          setFills((prev) => {
            const next = [...prev];
            next[i] = s.percent;
            return next;
          });
        },
        base + i * 70,
      ),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <div className="skill-page">
      <motion.div
        className="skill-page__motion"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <div className="skill-page__inner">
          <Typography.Title level={4} className="skill-page__title">
            技能
          </Typography.Title>

          <div className="skill-page__list-wrap">
            <motion.ul
              className="skill-page__list"
              variants={listVariants}
              initial="hidden"
              animate="show"
            >
              {SKILLS.map((skill, i) => (
                <motion.li key={skill.name} className="skill-page__row" variants={rowVariants}>
                  <span className="skill-page__name">{skill.name}</span>
                  <div className="skill-page__bar">
                    <Progress
                      percent={fills[i]}
                      showInfo={false}
                      strokeLinecap="round"
                      strokeColor={skill.percent >= 80 ? GREEN : AMBER}
                      size={{ height: 10 }}
                    />
                  </div>
                  <span className="skill-page__pct">{skill.percent}%</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SkillHome;
