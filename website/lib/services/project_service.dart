
import 'dart:convert';
import 'package:flutter/services.dart';
import '../models/project.dart';

class ProjectService {
  Future<List<Project>> getProjects() async {
    try {
      // Carrega o conteúdo do arquivo JSON
      final String response = await rootBundle.loadString('assets/data/projects.json');

      // Decodifica o JSON para uma lista de mapas
      final List<dynamic> jsonData = json.decode(response);

      // Converte cada mapa em um objeto Project
      return jsonData.map((json) => Project.fromJson(json)).toList();
    } catch (e) {
      // Em caso de erro, imprime o erro e retorna uma lista vazia
      print('Error loading projects: $e');
      return [];
    }
  }
}
