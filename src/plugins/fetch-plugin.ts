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

            build.onLoad({filter: /(^index\.js$)/}, () => {
                return {
                    loader: 'jsx',
                    contents: inputCode,
                };
            })

            build.onLoad({filter: /.css$/}, async(args:any): Promise<any> => {
                // Check to see if we have already fetched this file
                // and if it is in the cache, return immediately

                const cachedResult = await fileCache.getItem(args.path);

                if(cachedResult){
                    return cachedResult;
                }

                const { data, request } = await axios.get(args.path)


                console.log(request);
                console.log(data);


                // @ts-ignore
                const escaped = data.replace(/\n/g,'').replace(/"/g,'\\"').replace(/'/g,"\\'");

                const contents =
                    `
                        const style = document.createElement('style');
                        style.innerText = '${escaped}';
                        document.head.appendChild(style);
                    `
                const result = {
                    loader: "jsx",
                    contents,
                    resolveDir: new URL("./",request.responseURL).pathname
                }

                await fileCache.setItem(args.path,result)

                return result;
            })


            build.onLoad({ filter: /.*/ }, async (args: any): Promise<any> => {


                // Check to see if we have already fetched this file
                // and if it is in the cache, return immediately

                const cachedResult = await fileCache.getItem(args.path);

                if(cachedResult){
                    return cachedResult;
                }

                const { data, request } = await axios.get(args.path)


                console.log(request);
                console.log(data);


                // @ts-ignore


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