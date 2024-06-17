'use strict';
const respCodes=
	{
		success:200,
		unauthorized:401,
		forbidden:403,
		notFound:404,
		authenticationTimeout:419,
		unprocessableEntity:422,
	};

export default function processCallback (name,callbacks)
	{
		if (['response','error'].includes (name)) return addCallback.bind (this) (name);
		if (Object.keys (respCodes).includes (name)) return addCallback.bind (this) (respCodes[name]);
		if (name==='status')
			{
				return function (status,callback)
					{
						return (isFinite (status) && status>99 && status<600)?pushCallback.bind (this) (status,callback):this;
					};
			}
		let status=name.match (/^status(\d{3})$/);
		if (status)
			{
				status=parseInt (status.pop ());
				if (status>99 && status<600)
					{
						return addCallback.bind (this) (status);
					}
			}

		function addCallback (index)
			{
				return function (callback)
					{
						return pushCallback.bind (this) (index,callback);
					};
			}

		function pushCallback (index,callback)
			{
				if (typeof callback==='function')
					{
						if (!Array.isArray (callbacks[index])) callbacks[index]=[];
						callbacks[index].push (callback);
					}
				return this;
			}
	}
