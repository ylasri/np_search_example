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

import React, { useState, useEffect, useCallback } from 'react';
import { I18nProvider } from '@kbn/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { EuiPanel, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiHorizontalRule } from '@elastic/eui';
import { CoreStart } from '../../../../src/core/public';
import { getEsQueryConfig, buildEsQuery } from '../../../../src/plugins/data/common';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';
import { PLUGIN_ID, IMyStrategyResponse, SUSPECT_LIST_ROUTE_PATH } from '../../common';

import {
  DataPublicPluginStart,
  IndexPattern,
  QueryState,
  Query,
} from '../../../../src/plugins/data/public';
import { SuspectsGrid } from './grid';
import { ExportCSV } from './exporter';
import { SuspectsTable } from './table';
import { SuspectsAdvancedGrid } from './advanced_grid';

interface SearchExamplesAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  uiSettings: CoreStart['uiSettings'];
  savedObjectsClient: CoreStart['savedObjects']['client'];
  navigation: NavigationPublicPluginStart;
  data: DataPublicPluginStart;
  http: CoreStart['http'];
}

export const SearchExamplesApp = ({
  basename,
  notifications,
  uiSettings,
  navigation,
  data,
  http,
}: SearchExamplesAppDeps) => {
  const [result, setResult] = useState<any>();
  const [endData, setEndData] = useState<any>();
  const [indexPattern, setIndexPattern] = useState<IndexPattern | null>();
  const [queryState, setQueryState] = useState<QueryState | null>();
  const [kbnQuery, setKbnQuery] = useState<Query>();

  data.query.state$.subscribe(({ state }) => {
    setQueryState(state);
  });

  const onQuerySubmit = useCallback(
    ({ query }) => {
      setKbnQuery(query);
      doAsyncSearch();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kbnQuery]
  );

  useEffect(() => {
    const setDefaultIndexPattern = async () => {
      const getDefaultIndexPattern = await data.indexPatterns.getDefault();
      const defaultIP = uiSettings.get<any>('search:index_pattern');
      const defaultIndexPattern = await data.indexPatterns.get(defaultIP);
      if (defaultIndexPattern) {
        setIndexPattern(defaultIndexPattern);
      } else {
        setIndexPattern(getDefaultIndexPattern);
      }
    };
    setDefaultIndexPattern();
  }, [data, uiSettings]);

  const doAsyncSearch = async (strategy?: string) => {
    if (!indexPattern) return;
    // Read the query string, filters and time from the state we got from `data.query.state$`.
    const timeFilter = data.query.timefilter.timefilter.createFilter(
      indexPattern,
      queryState?.time
    );

    const queryFilters = [...(queryState?.filters || []), ...(timeFilter ? [timeFilter] : [])];

    // Constuct the query portion of the search request
    const esQuery = buildEsQuery(
      indexPattern,
      kbnQuery ? [kbnQuery] : [],
      queryFilters,
      getEsQueryConfig(uiSettings)
    );

    const request = {
      params: {
        index: indexPattern.title,
        size: 15,
        version: true,
        body: {
          // Constuct the aggregations portion of the search request by using the `data.search.aggs` service.
          aggs: {
            avg_call_charges: { avg: { field: 'call_charges' } },
          },
          query: esQuery,
        },
      },
    };

    const searchSubscription$ = data.search
      .search(request, {
        strategy,
      })
      .subscribe((response) => {
        const { is_partial, is_running }: any = response;
        // eslint-disable-next-line @typescript-eslint/camelcase
        if (!is_partial && !is_running) {
          const rawData: any[] = [];
          response.rawResponse.hits.hits.map((item) =>
            rawData.push({
              id: item._id,
              phone_number: item._source.phone_number,
              call_count: item._source.call_count,
              call_duration: item._source.call_duration.toFixed(2),
              call_charges: item._source.call_charges.toFixed(2),
              account_age: item._source.customer.account_age,
              churn: item._source.customer.churn,
              customer_service_calls: item._source.customer.customer_service_calls,
              international_plan: item._source.customer.international_plan,
              number_vmail_messages: item._source.customer.number_vmail_messages,
              state: item._source.customer.state,
              voice_mail_plan: item._source.customer.voice_mail_plan,
              // ml_results: item._source.ml_results,
            })
          );
          setResult(rawData);
          notifications.toasts.addSuccess({
            title: 'Query result',
            text: `Searched ${response.rawResponse.hits.total} documents. Result is ${
              response.rawResponse.aggregations?.avg_call_charges.value
            }. Is this Cool? ${(response as IMyStrategyResponse).cool}`,
          });
          searchSubscription$.unsubscribe();
          // eslint-disable-next-line @typescript-eslint/camelcase
        } else if (is_partial && !is_running) {
          // TODO: Make response error status clearer
          notifications.toasts.addWarning('An error has occurred');
          searchSubscription$.unsubscribe();
        }
      });

    // Call Back end route API
    try {
      const resp = await http.post(SUSPECT_LIST_ROUTE_PATH, {
        body: JSON.stringify(JSON.stringify(request.params)),
      });
      setEndData(resp.raw_data.hits.hits);
    } catch (e) {
      notifications.toasts.addDanger({
        title: 'Query result',
        text: 'An error has occurred when calling the backend',
      });
    }
  };

  if (!indexPattern) return null;

  const navConfig: any[] = [
    {
      id: 'new-item',
      label: 'New',
      run: () => {},
    },
    {
      id: 'save-item',
      label: 'Save',
      run: () => {},
      disableButton: () => {},
      tooltip: () => {},
    },
    {
      id: 'open-item',
      label: 'Open',
      run: () => {},
      disableButton: () => {},
      tooltip: () => {},
    },
    {
      id: 'inspect-item',
      label: 'Inspect',
      run: () => {},
      disableButton: () => {},
      tooltip: () => {},
    },
    {
      id: 'export-item',
      label: 'Export',
      run: () => {},
      disableButton: () => {},
      tooltip: () => {},
    },
  ];

  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={true}
            useDefaultBehaviors={true}
            indexPatterns={indexPattern ? [indexPattern] : undefined}
            onQuerySubmit={onQuerySubmit}
            showSaveQuery={true}
            query={kbnQuery}
            config={navConfig}
          />
          <EuiPanel style={{ margin: '16px' }} paddingSize="s">
            <div>
              <EuiFlexGroup gutterSize="s" alignItems="center">
                <EuiFlexItem grow={false}>
                  <ExportCSV csvData={result ? result : []} fileName={'file_name'} />
                </EuiFlexItem>
              </EuiFlexGroup>
              <EuiSpacer />
              <p>Data grid</p>
              <EuiHorizontalRule margin="xs" />
              {result && result.length > 0 ? <SuspectsGrid data={result} /> : null}
              <EuiSpacer />
              <p>Data grid control columns</p>
              <EuiHorizontalRule margin="xs" />
              {result && result.length > 0 ? <SuspectsAdvancedGrid data={result} /> : null}
              <EuiSpacer />
              <p>In-memory tables</p>
              <EuiHorizontalRule margin="xs" />
              {endData ? <SuspectsTable data={endData} /> : null}
            </div>
          </EuiPanel>
        </>
      </I18nProvider>
    </Router>
  );
};
