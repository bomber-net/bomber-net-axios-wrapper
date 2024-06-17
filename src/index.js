'use strict';
import axios           from 'axios';
import processRequest  from './process/processRequest';
import processCallback from './process/processCallback';

const requestMethods=
	{
		get:axios.get,
		post:axios.post,
		put:axios.put,
		'delete':axios.delete,
	};
let globalCallbacks={};

export default new Proxy (axios,
	{
		get (target,property,receiver)
			{
				if (Object.keys (requestMethods).includes (property))
					{
						return function (...props)
							{
								return processRequest (requestMethods[property],props,globalCallbacks);
							};
					}
				return processCallback.bind (receiver) (property,globalCallbacks);
			}
	});
