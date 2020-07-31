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

import { Comparators } from '@elastic/eui/lib/services/sort';
import { IEsSearchResponse } from '../../../src/plugins/data/common';

export const PLUGIN_ID = 'searchExample';
export const PLUGIN_NAME = 'Search Example';
export const PLUGIN_DESC = 'This plugin show how to use TopNavMenu stateful component for search';
export const APP_ICON = 'savedObjectsApp';
export const APP_PATH = `/app/${PLUGIN_ID}`;
export const PLUGIN_MSG = 'Welcome to search plugin';

export const CAT_ID = 'demo';
export const CAT_ICON = 'logoElasticsearch';
export const CAT_NAME = 'Demo™ Apps';

// Routes
export const SUSPECT_LIST_ROUTE_PATH = '/api/v1/suspect_list';
export const DEFAULT_INDEX_NAME = 'churn_predictions';

// This is here from the example, let's check later what's a strategy for search ...
export interface IMyStrategyResponse extends IEsSearchResponse {
  cool: boolean;
}

// This function is used to handle pagination with sorting
export function findItems(
  pageIndex: any,
  pageSize: any,
  sortField: any,
  sortDirection: any,
  items: any
) {
  let store;

  if (sortField) {
    store = items
      .slice(0)
      .sort(Comparators.property(sortField, Comparators.default(sortDirection)));
  } else {
    store = items;
  }

  let pageOfItems;

  if (!pageIndex && !pageSize) {
    pageOfItems = store;
  } else {
    const startIndex = pageIndex * pageSize;
    pageOfItems = store.slice(startIndex, Math.min(startIndex + pageSize, store.length));
  }

  return {
    pageOfItems,
    totalItemCount: store.length,
  };
}
