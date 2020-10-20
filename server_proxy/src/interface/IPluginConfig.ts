import Hapi from '@hapi/hapi';

export default interface IPluginConfig {
  list: Hapi.Plugin<Hapi.ServerRegisterOptions>[];
  options?: Hapi.ServerRegisterOptions;
}
