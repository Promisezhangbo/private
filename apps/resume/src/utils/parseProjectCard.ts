import type { ResumeProject } from '@/data/resumeContent';

export type ParsedProjectCard = {
  primaryLink?: { href: string; text: string };
  description: string;
  stackTags: string[];
  dutySectionTitle: string;
  dutyItems: string[];
};

function stripLeadingBullet(s: string) {
  return s.replace(/^\s*·+\s*/, '').trim();
}

function normalizeDutyTitle(label?: string) {
  if (!label) return '项目要点';
  const t = label.replace(/[：:]+$/u, '').trim();
  return t || '项目要点';
}

/** 将 blocks 拆成卡片渲染所需字段（与 resumeContent 约定一致） */
export function parseProjectCard(project: ResumeProject): ParsedProjectCard {
  let primaryLink: ParsedProjectCard['primaryLink'];
  let description = '';
  let stackRaw = '';
  let dutySectionTitle = '项目要点';
  const dutyItems: string[] = [];

  for (const b of project.blocks) {
    if (b.type === 'link') {
      if (!primaryLink) primaryLink = { href: b.href, text: b.text };
      continue;
    }
    if (b.type === 'paragraph') {
      const lab = b.label ?? '';
      if (lab.includes('项目描述') || b.text.startsWith('项目描述')) {
        description = b.text;
      } else if (lab.includes('技术栈') || b.text.startsWith('技术栈')) {
        stackRaw = b.text.replace(/^技术栈[：:]\s*/u, '').trim();
      }
      continue;
    }
    if (b.type === 'bullets') {
      dutySectionTitle = normalizeDutyTitle(b.label);
      dutyItems.length = 0;
      dutyItems.push(...b.items.map(stripLeadingBullet));
      continue;
    }
    if (b.type === 'lines') {
      dutySectionTitle = normalizeDutyTitle(b.label);
      dutyItems.length = 0;
      dutyItems.push(...b.items.map(stripLeadingBullet));
    }
  }

  const stackTags = stackRaw
    .split('、')
    .map((s) => s.trim())
    .filter(Boolean);

  return { primaryLink, description, stackTags, dutySectionTitle, dutyItems };
}
