import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:math';
import '../models/project.dart';
import '../services/project_service.dart';
import '../services/tag_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<String>> _tagsFuture;
  String? _selectedTag;
  List<Project> _allProjects = [];
  List<Project> _displayedProjects = [];
  int _currentPage = 1;
  final int _projectsPerPage = 5;

  @override
  void initState() {
    super.initState();
    _tagsFuture = TagService().getTags();
    _loadProjects();
  }

  void _loadProjects() async {
    _allProjects = await ProjectService().getProjects();
    _shuffleAndDisplayProjects();
  }

  void _shuffleAndDisplayProjects() {
    _allProjects.shuffle();
    _updateDisplayedProjects();
  }

  void _updateDisplayedProjects() {
    List<Project> filteredProjects = _selectedTag == null
        ? _allProjects
        : _allProjects.where((project) => project.tags.contains(_selectedTag)).toList();

    int startIndex = (_currentPage - 1) * _projectsPerPage;
    int endIndex = startIndex + _projectsPerPage;
    _displayedProjects = filteredProjects.sublist(
      startIndex,
      endIndex > filteredProjects.length ? filteredProjects.length : endIndex
    );
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage('assets/images/home_bg.png'),
            fit: BoxFit.cover,
            alignment: Alignment.topCenter,
          ),
        ),
        width: double.infinity,
        height: double.infinity,
        child: SingleChildScrollView(
          child: LayoutBuilder(
            builder: (BuildContext context, BoxConstraints constraints) {
              double scaleFactor = min(constraints.maxWidth / 1440, 1.0);
              return Center(
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: 1440),
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(80 * scaleFactor, 0, 20, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: 120 * scaleFactor),
                        // Header section
                        SizedBox(
                          width: min(829 * scaleFactor, constraints.maxWidth - 120 * scaleFactor),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'THIAGO GONÇALVES',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 54 * scaleFactor,
                                  fontWeight: FontWeight.w800,
                                  height: 1,
                                  letterSpacing: 5.40 * scaleFactor,
                                ),
                              ),
                              SizedBox(height: 12 * scaleFactor),
                              Opacity(
                                opacity: 0.90,
                                child: Text(
                                  '2D ARTIST + 2D ANIMATOR + GAMEDEV + SOUND DESIGNER',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 25 * scaleFactor,
                                    fontWeight: FontWeight.w600,
                                    height: 1,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: 60 * scaleFactor),
                        // About Me section
                        SizedBox(
                          width: 1229.50 * scaleFactor,
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 541 * scaleFactor,
                                height: 541 * scaleFactor,
                                decoration: ShapeDecoration(
                                  image: DecorationImage(
                                    image: AssetImage('assets/images/foto.png'),
                                    fit: BoxFit.cover,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    side: BorderSide(width: 10 * scaleFactor, color: Colors.grey[200]!),
                                  ),
                                ),
                              ),
                              SizedBox(width: 102.5 * scaleFactor),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: EdgeInsets.symmetric(
                                        horizontal: 12 * scaleFactor,
                                        vertical: 9 * scaleFactor,
                                      ),
                                      color: Colors.white,
                                      child: Text(
                                        'About Me',
                                        style: GoogleFonts.roboto(
                                          textStyle: TextStyle(
                                            color: Color(0xFFA92756),
                                            fontSize: 32 * scaleFactor,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                    ),
                                    SizedBox(height: 30 * scaleFactor),
                                    Container(
                                      color: Colors.white,
                                      padding: EdgeInsets.all(20 * scaleFactor),
                                      child: Text(
                                        'Product Designer with 10+ years of experience in UI/UX, illustration, and animation. Expertise in motion design, character design, and storyboarding. Proficient Game Developer in Unity, Godot, Rust (bevy ggez, comfy), javascript (phaser).',
                                        style: GoogleFonts.roboto(
                                          textStyle: TextStyle(
                                            color: Colors.black,
                                            fontSize: 25 * scaleFactor,
                                            fontWeight: FontWeight.w400,
                                            height: 1.2,
                                            letterSpacing: 3.25 * scaleFactor,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: 60 * scaleFactor),
                        // Skills section
                        Container(
                          width: 1194 * scaleFactor,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                color: Colors.white,
                                padding: EdgeInsets.symmetric(
                                  horizontal: 23.25 * scaleFactor,
                                  vertical: 5.41 * scaleFactor,
                                ),
                                child: Text(
                                  'Skills',
                                  style: GoogleFonts.roboto(
                                    textStyle: TextStyle(
                                      color: Color(0xFFA92756),
                                      fontSize: 32 * scaleFactor,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ),
                              SizedBox(height: 20 * scaleFactor),
                              Container(
                                color: Colors.white,
                                padding: EdgeInsets.all(20 * scaleFactor),
                                child: Text(
                                  'Creative full-stack game developer with expertise in illustration, animation, sound design, and technical implementation. Proficient in Unity, Godot, Rust, and JavaScript.',
                                  style: GoogleFonts.roboto(
                                    textStyle: TextStyle(
                                      color: Colors.black,
                                      fontSize: 25 * scaleFactor,
                                      fontWeight: FontWeight.w400,
                                      height: 1.2,
                                      letterSpacing: 3.25 * scaleFactor,
                                    ),
                                  ),
                                ),
                              ),
                              SizedBox(height: 30 * scaleFactor),
                              FutureBuilder<List<String>>(
                                future: _tagsFuture,
                                builder: (context, snapshot) {
                                  if (snapshot.connectionState == ConnectionState.waiting) {
                                    return CircularProgressIndicator();
                                  } else if (snapshot.hasError) {
                                    return Text('Error: ${snapshot.error}');
                                  } else if (snapshot.hasData) {
                                    return Wrap(
                                      spacing: 23 * scaleFactor,
                                      runSpacing: 10 * scaleFactor,
                                      children: snapshot.data!.map((tag) => GestureDetector(
                                        onTap: () {
                                          setState(() {
                                            _selectedTag = _selectedTag == tag ? null : tag;
                                            _currentPage = 1;
                                            _updateDisplayedProjects();
                                          });
                                        },
                                        child: Container(
                                          width: 250 * scaleFactor,
                                          height: 60 * scaleFactor,
                                          decoration: ShapeDecoration(
                                            color: _selectedTag == tag ? Color(0xFFA92756) : Color(0xFFA7A7A7),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8 * scaleFactor)),
                                          ),
                                          child: Center(
                                            child: Text(
                                              tag,
                                              textAlign: TextAlign.center,
                                              style: GoogleFonts.roboto(
                                                textStyle: TextStyle(
                                                  color: _selectedTag == tag ? Colors.white : Color(0xFFA92756),
                                                  fontSize: 21 * scaleFactor,
                                                  fontWeight: FontWeight.w700,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      )).toList(),
                                    );
                                  } else {
                                    return Text('No tags found');
                                  }
                                },
                              ),
                            ],
                          ),
                        ),
                        SizedBox(height: 60 * scaleFactor),
                        // Projects section
                        Column(
                          children: [
                            ..._displayedProjects.map((project) => buildProjectWidget(project, scaleFactor)).toList(),
                            SizedBox(height: 20 * scaleFactor),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                ElevatedButton(
                                  onPressed: _currentPage > 1
                                      ? () {
                                          setState(() {
                                            _currentPage--;
                                            _updateDisplayedProjects();
                                          });
                                        }
                                      : null,
                                  child: Text('Previous'),
                                ),
                                SizedBox(width: 20 * scaleFactor),
                                Text('Page $_currentPage'),
                                SizedBox(width: 20 * scaleFactor),
                                ElevatedButton(
                                  onPressed: _displayedProjects.length == _projectsPerPage
                                      ? () {
                                          setState(() {
                                            _currentPage++;
                                            _updateDisplayedProjects();
                                          });
                                        }
                                      : null,
                                  child: Text('Next'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget buildProjectWidget(Project project, double scaleFactor) {
    return Container(
      width: 1225.50 * scaleFactor,
      height: 720 * scaleFactor,
      margin: EdgeInsets.only(bottom: 60 * scaleFactor),
      child: Stack(
        children: [
          Positioned(
            left: 583.04 * scaleFactor,
            top: 247 * scaleFactor,
            child: Container(
              width: 642.46 * scaleFactor,
              height: 239 * scaleFactor,
              decoration: BoxDecoration(color: Colors.white),
            ),
          ),
          Positioned(
            left: 580.58 * scaleFactor,
            top: 52 * scaleFactor,
            child: Container(
              width: 360.15 * scaleFactor,
              height: 71 * scaleFactor,
              decoration: BoxDecoration(color: Colors.white),
            ),
          ),
          Positioned(
            left: 581.61 * scaleFactor,
            top: 121 * scaleFactor,
            child: Container(
              width: 590.56 * scaleFactor,
              height: 469 * scaleFactor,
              decoration: BoxDecoration(color: Colors.white),
            ),
          ),
          Positioned(
            left: 595.11 * scaleFactor,
            top: 121 * scaleFactor,
            child: SizedBox(
              width: 608.21 * scaleFactor,
              height: 211 * scaleFactor,
              child: Text(
                project.description,
                style: GoogleFonts.roboto(
                  textStyle: TextStyle(
                    color: Colors.black,
                    fontSize: 25 * scaleFactor,
                    fontWeight: FontWeight.w400,
                    height: 1.2,
                    letterSpacing: 3.25 * scaleFactor,
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            left: 595.11 * scaleFactor,
            top: 338 * scaleFactor,
            child: SizedBox(
              width: 608.21 * scaleFactor,
              height: 211 * scaleFactor,
              child: Text(
                project.additionalInfo,
                style: GoogleFonts.roboto(
                  textStyle: TextStyle(
                    color: Colors.black,
                    fontSize: 25 * scaleFactor,
                    fontWeight: FontWeight.w400,
                    height: 1.2,
                    letterSpacing: 3.25 * scaleFactor,
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            left: 580.58 * scaleFactor,
            top: 25 * scaleFactor,
            child: Container(
              width: 522.58 * scaleFactor,
              height: 100 * scaleFactor,
              child: Stack(
                children: [
                  Positioned(
                    left: 0,
                    top: 0,
                    child: Container(
                      width: 360.15 * scaleFactor,
                      height: 71 * scaleFactor,
                      decoration: BoxDecoration(color: Colors.white),
                    ),
                  ),
                  Positioned(
                    left: 12.97 * scaleFactor,
                    top: 20 * scaleFactor,
                    child: SizedBox(
                      width: 509.61 * scaleFactor,
                      height: 80 * scaleFactor,
                      child: Text(
                        project.name,
                        style: GoogleFonts.roboto(
                          textStyle: TextStyle(
                            color: Color(0xFFA92756),
                            fontSize: 32 * scaleFactor,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            left: 0,
            top: 0,
            child: Container(
              width: 420.35 * scaleFactor,
              height: 720 * scaleFactor,
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: AssetImage(project.imagePath),
                  fit: BoxFit.cover,
                ),
              ),
            ),
          ),
          Positioned(
            left: 591.92 * scaleFactor,
            top: 566 * scaleFactor,
            child: Wrap(
              spacing: 10 * scaleFactor,
              runSpacing: 10 * scaleFactor,
              children: project.tags.map((tag) => Container(
                padding: EdgeInsets.symmetric(horizontal: 20 * scaleFactor, vertical: 10 * scaleFactor),
                decoration: ShapeDecoration(
                  color: Color(0xFFA7A7A7),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8 * scaleFactor)),
                ),
                child: Text(
                  tag,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.roboto(
                    textStyle: TextStyle(
                      color: Color(0xFFA92756),
                      fontSize: 21 * scaleFactor,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              )).toList(),
            ),
          ),
          Positioned(
            left: 591.92 * scaleFactor,
            top: 640 * scaleFactor,
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 20 * scaleFactor, vertical: 10 * scaleFactor),
              decoration: ShapeDecoration(
                color: Color(0xFFA7A7A7),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8 * scaleFactor)),
              ),
              child: Text(
                project.status,
                textAlign: TextAlign.center,
                style: GoogleFonts.roboto(
                  textStyle: TextStyle(
                    color: Color(0xFFA92756),
                    fontSize: 21 * scaleFactor,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
