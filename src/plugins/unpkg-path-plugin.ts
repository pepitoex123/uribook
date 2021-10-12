import * as esbuild from 'esbuild-wasm';
import axios from "axios";
import localForage from "localforage";

const fileCache = localForage.createInstance({
    name: "filecache"
});



export const unpkgPathPlugin = (inputCode: string) => {
    return {
        name: 'unpkg-path-plugin',
        setup(build: esbuild.PluginBuild) {
            build.onResolve({filter: /(^index\.js$)/},() => {
                return { path: "index.js", namespace: "a"}
            })


            build.onResolve({filter: /^\.+\//},(args: any) => {
                return {
                    namespace: "a",
                    path: new URL(args.path, "https://unpkg.com" + args.resolveDir + "/").href
                }
            })


            build.onResolve({ filter: /.*/ }, async (args: any) => {

                return {
                    namespace: "a",
                    path: `https://unpkg.com/${args.path}`
                };

            });
            build.onLoad({ filter: /.*/ }, async (args: any): Promise<any> => {
                console.log('onLoad', args);
                if (args.path === 'index.js') {
                    return {
                        loader: 'jsx',
                        contents: inputCode,
                    };
                }

                // Check to see if we have already fetched this file
                // and if it is in the cache, return immediately

                const cachedResult = await fileCache.getItem(args.path);

                if(cachedResult){
                    return cachedResult;
                }

                const { data, request } = await axios.get(args.path)


                console.log(request);
                console.log(data);

                const result = {
                    loader: "jsx",
                    contents: data,
                    resolveDir: new URL("./",request.responseURL).pathname
                }

                await fileCache.setItem(args.path,result)

                return result;
            });
        },
    };
};