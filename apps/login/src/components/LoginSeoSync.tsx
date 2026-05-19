import { useLocale, useT } from '@packages/i18n';
import { applyDocumentSeo } from '@packages/seo';
import { useEffect } from 'react';

/** 随语言切换更新宿主 document SEO（qiankun 嵌入时同样生效） */
export default function LoginSeoSync() {
  const { locale } = useLocale();
  const { t } = useT('login');

  useEffect(() => {
    applyDocumentSeo(document, {
      title: t('seo.title'),
      description: t('seo.description'),
      keywords: t('seo.keywords'),
      robots: t('seo.robots'),
    });
  }, [locale, t]);

  return null;
}
