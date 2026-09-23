import 'dart:convert';
import 'package:flutter/services.dart';

class TagService {
  Future<List<String>> getTags() async {
    final String response = await rootBundle.loadString('assets/data/tags.json');
    final List<dynamic> data = await json.decode(response);
    return data.cast<String>();
  }
}
