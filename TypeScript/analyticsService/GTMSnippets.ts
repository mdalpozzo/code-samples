import { logger } from '../logdna';

// https://developers.google.com/tag-manager/quickstart

// code based on https://github.com/alinemorelli/react-gtm

interface Scripts {
  noScript: string;
  script: string;
  dataLayerVar: string;
}

export interface GetScriptsArgs {
  id: string;
  dataLayer?: Record<string, unknown>;
  dataLayerName: string;
  environment: 'stage' | 'production';
}

export const Snippets = {
  getScripts: ({ id, dataLayer, dataLayerName, environment }: GetScriptsArgs): Scripts => {
    // const gtmAuth = `&gtm_auth=${auth}`;
    // const gtmPreview = `&gtm_preview=${preview}`;

    if (!id) logger.warn('GTM Id is required');

    const noScriptIFrameProd = `
      <iframe
        src="https://www.googletagmanager.com/ns.html?id=${id}"
        height="0"
        width="0"
        style="display:none;visibility:hidden"
      ></iframe>
    `;

    const noScriptIFrameStage = `
      <iframe
        src="https://www.googletagmanager.com/ns.html?id=${id}&gtm_auth=xqD5bowgz64xmEWixr4ePg&gtm_preview=env-273&gtm_cookies_win=x"
        height="0"
        width="0"
        style="display:none;visibility:hidden"
      ></iframe>
    `;

    const scriptProd = `
      (function (w, d, s, l, i) {
          w[l] = w[l] || [];
          w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
          var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l != 'dataLayer' ? '&l=' + l : '';
          j.async = true;
          j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
          f.parentNode.insertBefore(j, f);
        })(window, document, 'script', '${dataLayerName}', '${id}');
    `;

    const scriptStage = `
      (function(w, d, s, l, i) {
        w[l]=w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event:'gtm.js' });
        var f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl + '&gtm_auth=xqD5bowgz64xmEWixr4ePg&gtm_preview=env-273&gtm_cookies_win=x';
        f.parentNode.insertBefore(j, f);
      })(window, document, 'script', '${dataLayerName}', '${id}');
    `;

    const dataLayerVar = Snippets.dataLayer(dataLayer, dataLayerName);

    return {
      noScript: environment === 'stage' ? noScriptIFrameStage : noScriptIFrameProd,
      script: environment === 'stage' ? scriptStage : scriptProd,
      dataLayerVar,
    };
  },
  dataLayer: (dataLayer: Record<string, unknown> | undefined, dataLayerName: string) => {
    return `
      window.${dataLayerName} = window.${dataLayerName} || [];
      window.${dataLayerName}.push(${JSON.stringify(dataLayer)})`;
  },
};

export default { Snippets };
