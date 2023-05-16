declare interface Window {
  nethackCallback: any;

  nethackJS: NetHackJS;
  nethackUI: NetHackGodot;

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