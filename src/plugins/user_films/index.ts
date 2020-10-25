import Hapi from '@hapi/hapi';
import IPluginConfig from '../../interface/IPluginConfig';
import PluginUserFilmsGet from './get';

const list: Hapi.Plugin<Hapi.ServerRegisterOptions>[] = [PluginUserFilmsGet];

const options: Hapi.ServerRegisterOptions = {
  routes: {
    prefix: '/user_films'
  }
};

const PluginUserFilms: IPluginConfig = {
  list,
  options
};

export default PluginUserFilms;
