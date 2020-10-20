import Hapi from '@hapi/hapi';
import IPluginConfig from '../interface/IPluginConfig';
// import AuthPlugins from './auth';

const plugins: IPluginConfig[] = [];

const PluginsV1 = async (server: Hapi.Server) => {
  await Promise.all(
    plugins.map(
      async (plugin: IPluginConfig) =>
        await server.register(plugin.list, plugin.options)
    )
  );
};

export default PluginsV1;
