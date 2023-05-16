declare interface Window {
  nethackCallback: any;

  nethackJS: NetHackJS;
  nethackGodot: NetHackGodot;

  nethackGlobal: {
    helpers: {
      mapglyphHelper: Function;
      getPointerValue: Function;
      setPointerValue: Function;
      createPointerValue: Function;
    };
    globals: Record<string, any>;
  };
}