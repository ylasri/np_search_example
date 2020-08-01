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
import { schema } from '@kbn/config-schema';
import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../src/core/server';
import {
  SearchExamplesPluginSetup,
  SearchExamplesPluginStart,
  SearchExamplesPluginSetupDeps,
  SearchExamplesPluginStartDeps,
} from './types';
import { defineRoutes } from './routes';
import { mySearchStrategyProvider } from './my_strategy';
import { PLUGIN_ID, APP_ICON, PLUGIN_NAME } from '../common';

export class SearchExamplesPlugin
  implements
    Plugin<
      SearchExamplesPluginSetup,
      SearchExamplesPluginStart,
      SearchExamplesPluginSetupDeps,
      SearchExamplesPluginStartDeps
    > {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(
    core: CoreSetup<SearchExamplesPluginStartDeps>,
    deps: SearchExamplesPluginSetupDeps
  ) {
    // UiSettings defaults registration performed during setup phase via core.uiSettings.register API.
    // This help to store some generic attributes of the App
    core.uiSettings.register({
      'search:index_pattern': {
        value: 'customer_churn_model',
        name: 'Default Index Pattern',
        description: 'Provide the default index pattern',
        category: ['Demo™ Apps'],
        requiresPageReload: true,
        schema: schema.string(),
      },
    });
    // Register Security Features in X-Pack
    // This help when creating new role for using the plugin
    if (deps.features) {
      deps.features.registerFeature({
        id: PLUGIN_ID,
        name: PLUGIN_NAME,
        order: 1200,
        icon: APP_ICON,
        navLinkId: PLUGIN_ID,
        app: [PLUGIN_ID, 'kibana'],
        catalogue: [PLUGIN_ID],
        validLicenses: ['platinum', 'enterprise', 'trial', 'basic'],
        privileges: {
          all: {
            api: [],
            app: [PLUGIN_ID, 'kibana'],
            catalogue: [PLUGIN_ID],
            savedObject: {
              all: [],
              read: [],
            },
            ui: ['show'],
          },
          read: {
            api: [],
            app: [PLUGIN_ID, 'kibana'],
            catalogue: [PLUGIN_ID],
            savedObject: {
              all: [],
              read: [],
            },
            ui: ['show'],
          },
        },
      });
    }
    this.logger.debug('search-examples: Setup');

    // This is here from the example, let's check later what's a strategy for search ...
    core.getStartServices().then(([_, depsStart]) => {
      const myStrategy = mySearchStrategyProvider(depsStart.data);
      deps.data.search.registerSearchStrategy('myStrategy', myStrategy);
    });

    // This help to define routes to be used by the front end
    const router = core.http.createRouter();
    // Register server side APIs
    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('search-examples: Started');
    return {};
  }

  public stop() {}
}
