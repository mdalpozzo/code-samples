import { isProd } from 'constants.js';
import { GetScriptsArgs, Snippets } from './GTMSnippets';

interface ExtendedWindow extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface InitializeArgs {
  gtmId: string;
  dataLayer: Record<string, unknown>;
  dataLayerName: string;
}

const GTMService = {
  /**
   * @description adds GTM script tags to HTML DOM
   * gtmId is the only required arg
   * dataLayerName defaults to 'dataLayer'
   */
  initialize({ gtmId, dataLayer, dataLayerName = 'dataLayer' }: InitializeArgs) {
    const gtm = GTMService.gtmElements({
      id: gtmId,
      dataLayer: dataLayer || undefined,
      dataLayerName,
      environment: isProd ? 'production' : 'stage',
    });
    if (dataLayer) document.head.appendChild(gtm.dataScript);
    document.head.insertBefore(gtm.script(), document.head.childNodes[0]);
    document.body.insertBefore(gtm.noScript(), document.body.childNodes[0]);
  },

  dataScript(dataLayer: string) {
    const script = document.createElement('script');
    script.innerHTML = dataLayer;
    return script;
  },

  gtmElements(args: GetScriptsArgs) {
    const snippets = Snippets.getScripts(args);

    const noScript = () => {
      const noscript = document.createElement('noscript');
      noscript.innerHTML = snippets.noScript;
      return noscript;
    };

    const script = () => {
      const scriptEl = document.createElement('script');
      scriptEl.innerHTML = snippets.script;
      return scriptEl;
    };

    const dataScript = GTMService.dataScript(snippets.dataLayerVar);

    return {
      noScript,
      script,
      dataScript,
    };
  },

  /**
   * @description pushes analytics event data to dataLayer if exists.
   */
  pushToDataLayer(dataLayer: Record<string, unknown>, dataLayerName = 'dataLayer') {
    const extendedWindow = (window as unknown) as ExtendedWindow;

    if (extendedWindow?.[dataLayerName]?.push) {
      extendedWindow[dataLayerName].push(dataLayer);
    }
    // *  code below is suppose to handle if requested dataLayer does not exist it will be created.
    // * if we need this functionality in the future we can pick up with commented code below
    // else {
    //   const snippets = Snippets.dataLayer(dataLayer, dataLayerName);
    //   const dataScript = GTMService.dataScript(snippets);
    //   document.head.insertBefore(dataScript, document.head.childNodes[0]);
    // }
  },
};

export default GTMService;
