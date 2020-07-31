import { schema } from '@kbn/config-schema';
import { IRouter } from '../../../../src/core/server';
import { SUSPECT_LIST_ROUTE_PATH } from '../../common';

export function registerGetSuspectsListRoute(router: IRouter) {
  router.post(
    {
      path: SUSPECT_LIST_ROUTE_PATH,
      /*
      All input (body, query parameters, and URL parameters) must be validated
      using the @kbn/config-schema package. If no validation schema is provided,
      these values will be empty objects.
      */
      validate: {
        params: schema.object({}, { unknowns: 'allow' }),
        body: schema.object({}, { unknowns: 'allow' }),
      },
      options: { xsrfRequired: false },
    },
    /*
    All exceptions thrown by handlers result in 500 errors. If you need a specific HTTP error code,
    catch any exceptions in your handler and construct the appropriate response using the provided
    response factory. While you can continue using the boom module internally in your plugin,
    the framework does not have native support for converting Boom exceptions into HTTP responses.

    router.handleLegacyErrors((context, req, res) => {
      throw Boom.notFound('not there'); // will be converted into proper New Platform error
    }),
    */
    async (context, request, response) => {
      const { index, size, version, body }: any = request.body;
      const query = {
        index,
        size,
        version,
        body: JSON.stringify(body),
      };
      const results = await context.core.elasticsearch.legacy.client.callAsCurrentUser(
        'search',
        query
      );
      return response.ok({
        body: {
          response_time: new Date().toISOString(),
          raw_data: results,
        },
      });
    }
  );
}
