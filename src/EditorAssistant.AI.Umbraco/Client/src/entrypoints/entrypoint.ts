import type { UmbEntryPointOnInit, UmbEntryPointOnUnload } from '@umbraco-cms/backoffice/extension-api';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { client } from '../api/client.gen.js';

export const onInit: UmbEntryPointOnInit = async (host) => {
  const authContext = await host.getContext(UMB_AUTH_CONTEXT);
  authContext?.configureClient(client);
};

export const onUnload: UmbEntryPointOnUnload = () => {};
