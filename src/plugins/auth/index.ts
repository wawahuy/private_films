import Hapi from '@hapi/hapi';
import PluginAuthFacebook from './facebook';
import IPluginConfig from '../../interface/IPluginConfig';
import PluginAuthLogin from './login';
import PluginAuthRegister from './register';
// import PluginAuthComplete from './complete_register';

const list: Hapi.Plugin<Hapi.ServerRegisterOptions>[] = [
  PluginAuthFacebook,
  PluginAuthLogin,
  PluginAuthRegister
  // PluginAuthComplete
];

const options: Hapi.ServerRegisterOptions = {
  routes: {
    prefix: '/auth'
  }
};

const PluginAuth: IPluginConfig = {
  list,
  options
};

export default PluginAuth;
