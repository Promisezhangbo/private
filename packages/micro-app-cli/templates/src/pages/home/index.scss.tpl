@use '@style-config/variables' as *;
@use '@style-config/mixins' as m;

.__NAME__-home {
  @include m.sub-app-page;
  padding: 24px 0 48px;

  @include m.respond-down($bp-sm) {
    padding: 16px 0 32px;
  }
}

.__NAME__-home__inner {
  @include m.sub-app-page-inner;
}
