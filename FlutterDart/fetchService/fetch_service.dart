import 'dart:convert';
import 'package:shared/services/auth_service/auth_service.dart';
import 'package:shared/services/logging_service.dart';
import 'package:shared/services/service.dart';
import 'dart:core';
import 'package:http/http.dart' as http;

enum FetchTypes {
  GET,
  POST,
  PATCH,
  PUT,
}

class CachedResponseObject {
  DateTime time = DateTime.now();
  http.Response response;

  CachedResponseObject({required this.response}) {
    time = DateTime.now();
  }
}

class FetchResponse {
  final http.Response response;

  FetchResponse({required this.response});

  Map<String, dynamic> get data {
    if (response.body.isNotEmpty) {
      return jsonDecode(response.body);
    }
    return {};
  }

  String get bodyRaw {
    return response.body;
  }

  int get statusCode {
    return response.statusCode;
  }

  http.Response get responseRaw {
    return response;
  }
}

class FetchService extends Service {
  //this setup makes AuthService a Singleton
  static FetchService? _instance;
  FetchService._internal() {
    //init();
  }

  factory FetchService() {
    if (_instance == null) {
      _instance = FetchService._internal();
    }
    return _instance as FetchService;
  }

  static Map<String, CachedResponseObject> _responseCache = {};

  /// TODO this should be able to get the base REST url internally, but for now we pass the complete url
  ///
  /// isCompanyApi - when set to true (default: false), auth token will be generated and injected into request headers
  static Future<FetchResponse> fetch(
    FetchTypes type,
    Uri url, {
    Object? body,
    int? cacheLifeSeconds,
    Map<String, String>? headers,
    Encoding? encoding,
    bool isCompanyApi = false,
  }) async {
    bool cachingEnabled = cacheLifeSeconds == null ? false : true;
    final String? bodyEncoded = body != null ? jsonEncode(body) : null;
    final dynamic bodyForRequest = encoding == null ? bodyEncoded : body;
    String? companyIdToken;

    if (isCompanyApi) {
      companyIdToken = await AuthService().user?.getIdToken();
      if (companyIdToken == null || companyIdToken.isEmpty) {
        Logger.i(
            'FetchService.cabanaApiRequest: Error getting id token for http authorization');
      }
    }

    String cacheKey = "${companyIdToken ?? ''}$type$url$bodyEncoded";
    CachedResponseObject? cachedResponseObject = _responseCache[cacheKey];

    if (cachingEnabled && cachedResponseObject != null) {
      DateTime rightNow = DateTime.now();
      DateTime? lastCachedTime = cachedResponseObject.time;
      int differenceInSeconds = lastCachedTime != null
          ? rightNow.difference(lastCachedTime).inSeconds
          : 0;
      if (differenceInSeconds <= cacheLifeSeconds) {
        return FetchResponse(response: cachedResponseObject.response);
      }
    }

    if (headers == null) {
      headers = {};
    }

    final mergedHeaders = <String, String>{
      'Content-Type': 'application/json; charset=UTF-8',
      ...headers,
      ...companyIdToken != null
          ? {'authorization': 'Bearer $companyIdToken'}
          : {},
    };

    switch (type) {
      case FetchTypes.GET:
        {
          http.Response response = await http.get(
            url,
            headers: mergedHeaders,
          );
          if (cachingEnabled) {
            _responseCache[cacheKey] = CachedResponseObject(response: response);
          }
          return FetchResponse(response: response);
        }
      case FetchTypes.POST:
        {
          http.Response response = await http.post(
            url,
            headers: mergedHeaders,
            body: bodyForRequest,
            encoding: encoding,
          );
          if (cachingEnabled) {
            _responseCache[cacheKey] = CachedResponseObject(response: response);
          }
          return FetchResponse(response: response);
        }
      case FetchTypes.PATCH:
        {
          http.Response response = await http.patch(
            url,
            headers: mergedHeaders,
            body: bodyForRequest,
            encoding: encoding,
          );
          if (cachingEnabled) {
            _responseCache[cacheKey] = CachedResponseObject(response: response);
          }
          return FetchResponse(response: response);
        }
      case FetchTypes.PUT:
        {
          http.Response response = await http.put(
            url,
            headers: mergedHeaders,
            body: bodyForRequest,
            encoding: encoding,
          );
          if (cachingEnabled) {
            _responseCache[cacheKey] = CachedResponseObject(response: response);
          }
          return FetchResponse(response: response);
        }
      // TODO handle error default case
      default:
        {
          throw Exception('Invalid http request type: $type');
        }
    }
  }
}
