@use '@style-config/mixins' as m;
@use '@style-config/semantic-palette';

#app-root {
  --__NAME__-ink: var(--sc-blog-ink);
  --__NAME__-muted: var(--sc-blog-muted);

  @include m.sub-app-root-blog-surface($stack-children: true);
  color: var(--__NAME__-ink);
}

.main-content--micro #sub-app #root {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
