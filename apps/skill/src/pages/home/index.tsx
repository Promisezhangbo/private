import { Progress, Typography } from "antd";
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

const listVariantsRight = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.22 },
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

const MID = Math.ceil(SKILLS.length / 2);
const SKILLS_LEFT = SKILLS.slice(0, MID);
const SKILLS_RIGHT = SKILLS.slice(MID);

function SkillRow({ skill, fill }: { skill: (typeof SKILLS)[number]; fill: number }) {
  return (
    <motion.li className="skill-page__row" variants={rowVariants}>
      <div className="skill-page__row-head">
        <span className="skill-page__name">{skill.name}</span>
        <span className="skill-page__pct">{skill.percent}%</span>
      </div>
      <div className="skill-page__bar">
        <Progress
          percent={fill}
          showInfo={false}
          strokeLinecap="round"
          strokeColor={skill.percent >= 80 ? GREEN : AMBER}
          size={{ height: 10 }}
        />
      </div>
    </motion.li>
  );
}

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
            <div className="skill-page__columns">
              <motion.ul
                className="skill-page__list"
                variants={listVariants}
                initial="hidden"
                animate="show"
              >
                {SKILLS_LEFT.map((skill, j) => (
                  <SkillRow key={skill.name} skill={skill} fill={fills[j]} />
                ))}
              </motion.ul>
              <motion.ul
                className="skill-page__list"
                variants={listVariantsRight}
                initial="hidden"
                animate="show"
              >
                {SKILLS_RIGHT.map((skill, j) => (
                  <SkillRow key={skill.name} skill={skill} fill={fills[MID + j]} />
                ))}
              </motion.ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SkillHome;
