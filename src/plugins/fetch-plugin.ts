import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localForage from "localforage";

const fileCache = localForage.createInstance({
    name: "filecache"
});


export const fetchPlugin = (inputCode: string) => {
    return{
        name: "fetch-plugin",
        setup(build: esbuild.PluginBuild){
            build.onLoad({ filter: /.*/ }, async (args: any): Promise<any> => {
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
        }
    }
}