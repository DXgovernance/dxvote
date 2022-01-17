import { BigNumber, ethers } from 'ethers';
import { walletContracts } from '@0xsequence/abi';
import { getRandomInt, promisify } from '@0xsequence/utils';
import { sequenceContext, JsonRpcVersion } from '@0xsequence/network';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

let JsonRpcMethod;

(function (JsonRpcMethod) {
  JsonRpcMethod["ethCall"] = "eth_call";
  JsonRpcMethod["ethGetBalance"] = "eth_getBalance";
  JsonRpcMethod["ethGetCode"] = "eth_getCode";
})(JsonRpcMethod || (JsonRpcMethod = {}));

async function safeSolve(promise, def) {
  try {
    return await promise;
  } catch (e) {
    const d = def instanceof Function ? def(e) : def;
    return d;
  }
}
function partition(array, callback) {
  return array.reduce(function (result, element, i) {
    callback(element, i) ? result[0].push(element) : result[1].push(element);
    return result;
  }, [[], []]);
}
function parseBlockTag(cand) {
  if (cand === undefined) return 'latest';

  switch (cand) {
    case 'earliest':
    case 'latest':
    case 'pending':
      return cand;
  }

  return BigNumber.from(cand);
}
function eqBlockTag(a, b) {
  if (a === b) return true;

  if (BigNumber.isBigNumber(a)) {
    if (BigNumber.isBigNumber(b)) return a.eq(b);
    return false;
  }

  if (BigNumber.isBigNumber(b)) return false;
  return a === b;
}

const DefaultMulticallOptions = {
  batchSize: 50,
  timeWindow: 50,
  contract: sequenceContext.sequenceUtils,
  verbose: false
};
class Multicall {
  constructor(options) {
    var _this = this;

    this.batchableJsonRpcMethods = [JsonRpcMethod.ethCall, JsonRpcMethod.ethGetCode, JsonRpcMethod.ethGetBalance];
    this.multicallInterface = new ethers.utils.Interface(walletContracts.sequenceUtils.abi);
    this.options = void 0;
    this.timeout = void 0;
    this.queue = [];

    this.scheduleExecution = () => {
      if (this.queue.length > 0) {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(this.run, this.options.timeWindow);
      }
    };

    this.handle = (next, request, callback) => {
      // Schedule for batching and return
      if (this.batchableJsonRpcMethods.find(m => m === request.method)) {
        this.queue.push({
          request: request,
          callback: callback,
          next: next
        });
        if (this.options.verbose) console.log('Scheduling call', request.method);
        this.scheduleExecution();
        return;
      }

      if (this.options.verbose) console.log('Forwarded call', request.method); // Move to next handler

      return next(request, callback);
    };

    this.run = async function () {
      /* eslint-disable no-var */
      if (_this.options.verbose) console.log('Processing multicall'); // Read items from queue

      const limit = Math.min(_this.options.batchSize, _this.queue.length);
      if (limit === 0) return; // Skip multicall on single item

      if (limit === 1) {
        _this.forward(_this.queue[0]);

        _this.queue = [];
        if (_this.options.verbose) console.log('Skip multicall, single item');
        return;
      }

      if (_this.options.verbose) console.log('Resolving', limit); // Get batch from queue

      var items = _this.queue.slice(0, limit); // Update queue


      _this.queue = limit === _this.queue.length ? [] : _this.queue.slice(limit);
      if (_this.options.verbose) console.log('Updated queue', _this.queue.length);

      if (_this.queue.length !== 0) {
        _this.scheduleExecution();
      } // Get next candidate


      const next = items[0].next;
      let blockTag; // Partition incompatible calls

      var [items, discartItems] = partition(items, item => {
        try {
          // Mixed next callbacks
          if (item.next !== next) return false;

          switch (item.request.method) {
            case JsonRpcMethod.ethCall:
              // Unsupported eth_call parameters
              if (item.request.params[0].from || item.request.params[0].gasPrice || item.request.params[0].value) {
                return false;
              }

            case JsonRpcMethod.ethGetBalance:
            case JsonRpcMethod.ethGetCode:
              // Mixed blockTags
              const itemBlockTag = parseBlockTag(item.request.params[1]);
              if (blockTag === undefined) blockTag = itemBlockTag;
              if (!eqBlockTag(itemBlockTag, blockTag)) return false;
          }

          return true;
        } catch (_unused) {
          return false;
        }
      }); // Forward discarted items
      // end execution if no items remain

      if (discartItems.length !== 0) {
        if (_this.options.verbose) console.log('Forwarding incompatible calls', discartItems.length);

        _this.forward(discartItems);

        if (items.length === 0) return;
      } // Aggregate all calls


      let callParams = items.map(v => {
        try {
          switch (v.request.method) {
            case JsonRpcMethod.ethCall:
              return {
                delegateCall: false,
                revertOnError: false,
                target: v.request.params[0].to,
                data: v.request.params[0].data,
                gasLimit: v.request.params[0].gas ? v.request.params[0].gas : 0,
                value: 0
              };

            case JsonRpcMethod.ethGetCode:
              return {
                delegateCall: false,
                revertOnError: false,
                target: _this.options.contract,
                gasLimit: 0,
                value: 0,
                data: _this.multicallInterface.encodeFunctionData(_this.multicallInterface.getFunction('callCode'), [v.request.params[0]])
              };

            case JsonRpcMethod.ethGetBalance:
              return {
                delegateCall: false,
                revertOnError: false,
                target: _this.options.contract,
                gasLimit: 0,
                value: 0,
                data: _this.multicallInterface.encodeFunctionData(_this.multicallInterface.getFunction('callBalanceOf'), [v.request.params[0]])
              };

            default:
              return null;
          }
        } catch (_unused2) {
          return null;
        }
      }); // Filter calls with enconding errors and forward items

      var [items, discartItems] = partition(items, (_, i) => callParams[i] !== undefined);
      callParams = callParams.filter(c => c);

      if (discartItems.length !== 0) {
        if (_this.options.verbose) console.log('Forwarding calls on error', discartItems.length);

        _this.forward(discartItems);

        if (items.length === 0) return;
      } // Encode multicall


      let encodedCall;

      try {
        encodedCall = _this.multicallInterface.encodeFunctionData(_this.multicallInterface.getFunction('multiCall'), [callParams]);
      } catch (_unused3) {
        _this.forward(items);

        return;
      } // Forward single multicall rpc call


      const reqId = getRandomInt(); // TODO: fix types below..

      const res = await safeSolve( // @ts-ignore
      promisify(next)({
        id: reqId,
        jsonrpc: JsonRpcVersion,
        method: JsonRpcMethod.ethCall,
        params: [{
          to: _this.options.contract,
          value: 0,
          data: encodedCall
        }, BigNumber.isBigNumber(blockTag) ? blockTag.toNumber() : blockTag] // @ts-ignore

      }), e => ({
        jsonrpc: JsonRpcVersion,
        id: reqId,
        result: undefined,
        error: e
      })); // Error calling multicall
      // Forward all calls to middleware
      // @ts-ignore

      if (res.error) {
        return _this.forward(items);
      } // Decode result from multicall


      let decoded;

      try {
        // @ts-ignore
        decoded = _this.multicallInterface.decodeFunctionResult(_this.multicallInterface.getFunction('multiCall'), res.result);
      } catch (_unused4) {
        _this.forward(items);

        return;
      } // Send results for each request
      // errors fallback through the middleware


      if (_this.options.verbose) console.log('Got response for', items.length);
      items.forEach((item, index) => {
        if (!decoded[0][index]) {
          _this.forward(item);
        } else {
          switch (item.request.method) {
            case JsonRpcMethod.ethCall:
              item.callback(undefined, {
                jsonrpc: item.request.jsonrpc,
                id: item.request.id,
                result: decoded[1][index]
              });
              break;

            case JsonRpcMethod.ethGetCode:
              item.callback(undefined, {
                jsonrpc: item.request.jsonrpc,
                id: item.request.id,
                result: ethers.utils.defaultAbiCoder.decode(['bytes'], decoded[1][index])[0]
              });
              break;

            case JsonRpcMethod.ethGetBalance:
              item.callback(undefined, {
                jsonrpc: item.request.jsonrpc,
                id: item.request.id,
                result: ethers.utils.defaultAbiCoder.decode(['uint256'], decoded[1][index])[0]
              });
              break;
          }
        }
      });
    };

    this.options = options ? _extends({}, Multicall.DefaultOptions, options) : Multicall.DefaultOptions;
    if (this.options.batchSize <= 0) throw new Error(`Invalid batch size of ${this.options.batchSize}`);
  }

  forward(entries) {
    if (Array.isArray(entries)) {
      entries.forEach(e => e.next(e.request, e.callback));
    } else {
      entries.next(entries.request, entries.callback);
    }
  }

  static isMulticall(cand) {
    return cand && cand.handle !== undefined && cand.conf !== undefined && Multicall.isMulticallOptions(cand.options);
  }

  static isMulticallOptions(cand) {
    return cand !== undefined && cand.batchSize !== undefined && cand.timeWindow !== undefined && cand.contract !== undefined;
  }

}
Multicall.DefaultOptions = _extends({}, DefaultMulticallOptions);

const ProxyMethods = ['getNetwork', 'getBlockNumber', 'getGasPrice', 'getTransactionCount', 'getStorageAt', 'sendTransaction', 'estimateGas', 'getBlock', 'getTransaction', 'getTransactionReceipt', 'getLogs', 'emit', 'litenerCount', 'addListener', 'removeListener', 'waitForTransaction', 'detectNetwork', 'getBlockWithTransactions'];
class MulticallProvider extends ethers.providers.BaseProvider {
  constructor(provider, multicall) {
    var _this;

    super(provider.getNetwork());
    _this = this;
    this.provider = provider;
    this.multicall = void 0;
    this.listenerCount = this.provider.listenerCount;

    this.getResolver = async function (name) {
      const provider = _this.provider;

      if (provider.getResolver) {
        const ogResolver = await provider.getResolver(await name);
        if (!ogResolver) return null;
        return new ethers.providers.Resolver(_this, ogResolver.address, ogResolver.name);
      }

      return provider.getResolver(await name);
    };

    this.next = async function (req, callback) {
      try {
        switch (req.method) {
          case JsonRpcMethod.ethCall:
            _this.callback(req, callback, await _this.provider.call(req.params[0], req.params[1]));

            break;

          case JsonRpcMethod.ethGetCode:
            _this.callback(req, callback, await _this.provider.getCode(req.params[0], req.params[1]));

            break;

          case JsonRpcMethod.ethGetBalance:
            _this.callback(req, callback, await _this.provider.getBalance(req.params[0], req.params[1]));

            break;
        }
      } catch (e) {
        _this.callback(req, callback, undefined, e);
      }
    };

    this.multicall = Multicall.isMulticall(multicall) ? multicall : new Multicall(multicall);
    ProxyMethods.forEach(m => {
      if (provider[m] !== undefined) {

        this[m] = (...args) => provider[m](...args);
      }
    });
  }

  callback(req, callback, resp, err) {
    callback(err, {
      jsonrpc: JsonRpcVersion,
      id: req.id,
      result: resp,
      error: err
    });
  }

  async call(transaction, blockTag) {
    return this.rpcCall(JsonRpcMethod.ethCall, transaction, blockTag);
  }

  async getCode(addressOrName, blockTag) {
    return this.rpcCall(JsonRpcMethod.ethGetCode, addressOrName, blockTag);
  }

  async getBalance(addressOrName, blockTag) {
    return this.rpcCall(JsonRpcMethod.ethGetBalance, addressOrName, blockTag);
  }

  async rpcCall(method, ...params) {
    const reqId = getRandomInt();
    const resp = await promisify(this.multicall.handle)(this.next, {
      jsonrpc: JsonRpcVersion,
      id: reqId,
      method: method,
      params: params
    });
    return resp.result;
  }

}

class MulticallExternalProvider {
  constructor(provider, multicall) {
    this.provider = provider;
    this.multicall = void 0;
    this.multicall = Multicall.isMulticall(multicall) ? multicall : new Multicall(multicall);

    if (provider.send) {
      const next = async function next(req, callback) {
        provider.send(req, callback);
      };

      this.send = (request, callback) => {
        this.multicall.handle(next, request, callback);
      };
    }

    if (provider.sendAsync) {
      const next = async function next(req, callback) {
        provider.sendAsync(req, callback);
      };

      this.sendAsync = (request, callback) => {
        this.multicall.handle(next, request, callback);
      };
    }
  }

  get isMetaMask() {
    return this.provider.isMetaMask;
  }

  get isStatus() {
    return this.provider.isStatus;
  }

}

const multicallMiddleware = multicall => next => {
  const lib = Multicall.isMulticall(multicall) ? multicall : new Multicall(multicall);
  return (request, callback) => {
    return lib.handle(next, request, callback);
  };
};

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ProxyMethods: ProxyMethods,
  MulticallProvider: MulticallProvider,
  MulticallExternalProvider: MulticallExternalProvider,
  multicallMiddleware: multicallMiddleware
});

export { Multicall, index as providers };
