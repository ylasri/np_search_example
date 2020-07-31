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

import { ISearchStrategy, PluginStart } from '../../../src/plugins/data/server';
import { IMyStrategyResponse } from '../common';

export const mySearchStrategyProvider = (data: PluginStart): ISearchStrategy => {
  const es = data.search.getSearchStrategy('es');
  return {
    search: async (context, request, options): Promise<IMyStrategyResponse> => {
      request.debug = true;
      const esSearchRes = await es.search(context, request, options);
      // Hummm, a strategy may be used to modify es raw response result before return it to from end!
      // Sounds interesting here
      // Let's check it later
      console.log(esSearchRes);
      return {
        ...esSearchRes,
        cool: true,
      };
    },
    cancel: async (context, id) => {
      if (es.cancel) {
        es.cancel(context, id);
      }
    },
  };
};
