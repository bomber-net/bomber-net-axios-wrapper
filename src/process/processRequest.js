'use strict';
import processCallback from './processCallback';

export default function processRequest (method,props,globalCallbacks)
	{
		let localCallbacks={};
		processMethod (method,props,localCallbacks,globalCallbacks);
		return new Proxy (localCallbacks,{get:(target,property,receiver)=>processCallback.bind (receiver) (property,localCallbacks)});

		function processMethod (method,props,localCallbacks,globalCallbacks)
			{
				method (...props).then (async response=>
					{
						if (await processResponse (response,localCallbacks,globalCallbacks)) processMethod (method,props,localCallbacks,globalCallbacks);
					}).catch (async ({response})=>
						{
							if (await processResponse (response,localCallbacks,globalCallbacks)) processMethod (method,props,localCallbacks,globalCallbacks);
						});

				async function processResponse (response,localCallbacks,globalCallbacks)
					{
						for (let callbacks of [localCallbacks,globalCallbacks])
							{
								switch (await process (response,callbacks))
									{
										case true:return true;
										case false:return false;
									}
							}
					}

				async function process ({status,statusText,data,headers},callbacks)
					{
						if (Array.isArray (callbacks[status]))
							{
								for (let callback of callbacks[status])
									{
										if (typeof callback==='function')
											{
												switch (await callback (data,headers,statusText))
													{
														case true:return true;
														case false:return false;
													}
											}
									}
							}
						if (Array.isArray (callbacks.response))
							{
								for (let callback of callbacks.response)
									{
										if (typeof callback==='function')
											{
												switch (await callback ({status,statusText,data,headers}))
													{
														case true:return true;
														case false:return false;
													}
											}
									}
							}
						if (Array.isArray (callbacks.error) && status>399)
							{
								for (let callback of callbacks.error)
									{
										if (typeof callback==='function')
											{
												switch (await callback ({status,statusText,data,headers}))
													{
														case true:return true;
														case false:return false;
													}
											}
									}
							}
					}
			}
	}
