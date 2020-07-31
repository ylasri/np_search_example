/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../src/core/public';
import { FeatureCatalogueCategory } from '../../../src/plugins/home/public';
import {
  PLUGIN_NAME,
  PLUGIN_DESC,
  PLUGIN_ID,
  APP_ICON,
  APP_PATH,
  CAT_ICON,
  CAT_ID,
  CAT_NAME,
} from '../common';
import {
  SearchExamplesPluginSetup,
  SearchExamplesPluginStart,
  AppPluginSetupDependencies,
  AppPluginStartDependencies,
} from './types';

export class SearchExamplesPlugin
  implements
    Plugin<
      SearchExamplesPluginSetup,
      SearchExamplesPluginStart,
      AppPluginSetupDependencies,
      AppPluginStartDependencies
    > {
  public setup(
    core: CoreSetup<AppPluginStartDependencies>,
    deps: AppPluginSetupDependencies
  ): SearchExamplesPluginSetup {
    // Register an application into the home page of Kibana
    deps.home.featureCatalogue.register({
      id: PLUGIN_ID,
      title: PLUGIN_NAME,
      description: PLUGIN_DESC,
      icon: APP_ICON,
      path: APP_PATH,
      showOnHomePage: true,
      category: FeatureCatalogueCategory.OTHER,
    });
    // Register an application into the side navigation menu
    core.application.register({
      id: PLUGIN_ID,
      title: PLUGIN_NAME,
      order: 1000,
      euiIconType: APP_ICON,
      category: {
        id: CAT_ID,
        label: CAT_NAME,
        euiIconType: CAT_ICON,
        order: 4000,
      },
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in kibana.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart, params);
      },
    });

    return {};
  }

  public start(core: CoreStart): SearchExamplesPluginStart {
    return {};
  }

  public stop() {}
}
