class Project {
  final String name;
  final String description;
  final String additionalInfo;
  final String imagePath;
  final List<String> tags;
  final String status;

  Project({
    required this.name,
    required this.description,
    required this.additionalInfo,
    required this.imagePath,
    required this.tags,
    required this.status,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      name: json['name'],
      description: json['description'],
      additionalInfo: json['additionalInfo'],
      imagePath: json['imagePath'],
      tags: List<String>.from(json['tags']),
      status: json['status'],
    );
  }
}
