import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:math';
import '../models/project.dart';
import '../services/project_service.dart';
import '../services/tag_service.dart';

// English constants
const String kNameEN = 'THIAGO GONÇALVES';
const String kTitleEN = '2D ARTIST + 2D ANIMATOR + GAMEDEV + SOUND DESIGNER';
const String kAboutMeTitleEN = 'About Me';
const String kAboutMeContentEN =
    'With over 10 years of experience in the creative industry, I\'ve honed my skills as a multidisciplinary artist and developer. My passion lies in bringing ideas to life through various mediums, from traditional art to interactive experiences. Also gardener and beekeeper!';
const String kSkillsTitleEN = 'Skills';
const String kSkillsContentEN =
    'As a creative polymath, I blend artistry with technology to craft immersive digital experiences. My toolkit spans from traditional illustration to cutting-edge game development, allowing me to breathe life into ideas across multiple platforms. Whether it\'s designing intuitive user interfaces, animating captivating characters, or engineering robust game systems, I thrive on pushing the boundaries of interactive storytelling.';

// Portuguese constants
const String kNamePT = 'THIAGO GONÇALVES';
const String kTitlePT = 'ARTISTA 2D + ANIMADOR 2D + GAMEDEV + SOUND DESIGNER';
const String kAboutMeTitlePT = 'Sobre Mim';
const String kAboutMeContentPT =
    'Com mais de uma década de experiência na indústria criativa, refinei e expandi minhas habilidades como artista e desenvolvedor multidisciplinar. Minha paixão reside em dar vida a ideias inovadoras através de uma ampla gama de meios, desde a arte tradicional até as mais avançadas experiências interativas. Esta jornada criativa não se limita apenas ao mundo digital; sou também um entusiasta jardineiro e apicultor!';
const String kSkillsTitlePT = 'Habilidades';
const String kSkillsContentPT =
    'Como um artista multifacetado, fundo arte e tecnologia para criar experiências digitais envolventes e inovadoras. Minha expertise abrange desde ilustração tradicional até o desenvolvimento de jogos de última geração, permitindo-me transformar conceitos em realidade através de diversas plataformas. Seja concebendo interfaces intuitivas, dando vida a personagens memoráveis ou arquitetando sistemas de jogo complexos, minha paixão está em ultrapassar as fronteiras da narrativa interativa, sempre buscando novas formas de cativar e surpreender o público.';

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
  final int _projectsPerPage = 4;
  bool _isEnglish = false; // New variable to track language

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
        : _allProjects
            .where((project) => project.tags.contains(_selectedTag))
            .toList();

    int startIndex = (_currentPage - 1) * _projectsPerPage;
    int endIndex = startIndex + _projectsPerPage;
    _displayedProjects = filteredProjects.sublist(
        startIndex,
        endIndex > filteredProjects.length
            ? filteredProjects.length
            : endIndex);
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    bool isMobile = MediaQuery.of(context).size.width < 600;
    String backgroundImage =
        isMobile ? 'assets/images/mobtest2.jpg' : 'assets/images/home_desk.jpg';

    return Scaffold(
      body: SingleChildScrollView(
        child: Stack(
          children: [
            Image.asset(
              backgroundImage,
              width: MediaQuery.of(context).size.width,
              fit: BoxFit.cover,
            ),
            LayoutBuilder(
              builder: (BuildContext context, BoxConstraints constraints) {
                double scaleFactor = min(constraints.maxWidth / 1440, 1.0);
                return Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 1440),
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(80 * scaleFactor,
                          120 * scaleFactor, 20 * scaleFactor, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildHeader(scaleFactor, constraints),
                          SizedBox(height: 60 * scaleFactor),
                          _buildAboutMe(scaleFactor),
                          SizedBox(height: 60 * scaleFactor),
                          _buildSkills(scaleFactor),
                          SizedBox(height: 60 * scaleFactor),
                          _buildProjects(scaleFactor),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(double scaleFactor, BoxConstraints constraints) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width:
              min(829 * scaleFactor, constraints.maxWidth - 120 * scaleFactor),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _isEnglish ? kNameEN : kNamePT,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 54 * scaleFactor,
                  fontWeight: FontWeight.w800,
                  height: 1,
                  letterSpacing: 5.40 * scaleFactor,
                ),
              ),
              SizedBox(height: 5 * scaleFactor),
              Opacity(
                opacity: 0.90,
                child: Text(
                  _isEnglish ? kTitleEN : kTitlePT,
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
        SizedBox(height: 20 * scaleFactor),
        Row(
          children: [
            _buildLanguageButton('🇺🇸 EN', true, scaleFactor),
            SizedBox(width: 10 * scaleFactor),
            _buildLanguageButton('🇧🇷 PT', false, scaleFactor),
          ],
        ),
      ],
    );
  }

  Widget _buildLanguageButton(String text, bool isEnglish, double scaleFactor) {
    return ElevatedButton(
      onPressed: () {
        setState(() {
          _isEnglish = isEnglish;
        });
      },
      style: ElevatedButton.styleFrom(
        backgroundColor: _isEnglish == isEnglish ? Colors.white : Colors.grey,
        foregroundColor: _isEnglish == isEnglish ? Colors.black : Colors.white,
        padding: EdgeInsets.symmetric(
          horizontal: 8 * scaleFactor,
          vertical: 4 * scaleFactor,
        ),
        minimumSize: Size(30 * scaleFactor, 30 * scaleFactor),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 20 * scaleFactor),
      ),
    );
  }

  Widget _buildAboutMe(double scaleFactor) {
    return SizedBox(
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
                side: BorderSide(
                    width: 10 * scaleFactor, color: Colors.grey[200]!),
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
                    _isEnglish ? kAboutMeTitleEN : kAboutMeTitlePT,
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
                    _isEnglish ? kAboutMeContentEN : kAboutMeContentPT,
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
    );
  }

  Widget _buildSkills(double scaleFactor) {
    return Container(
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
              _isEnglish ? kSkillsTitleEN : kSkillsTitlePT,
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
              _isEnglish ? kSkillsContentEN : kSkillsContentPT,
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
                  children: snapshot.data!
                      .map((tag) => GestureDetector(
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
                                color: _selectedTag == tag
                                    ? Color(0xFFA92756)
                                    : Color(0xFFA7A7A7),
                                shape: RoundedRectangleBorder(
                                    borderRadius:
                                        BorderRadius.circular(8 * scaleFactor)),
                              ),
                              child: Center(
                                child: Text(
                                  tag,
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.roboto(
                                    textStyle: TextStyle(
                                      color: _selectedTag == tag
                                          ? Colors.white
                                          : Color(0xFFA92756),
                                      fontSize: 21 * scaleFactor,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ))
                      .toList(),
                );
              } else {
                return Text('No tags found');
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildProjects(double scaleFactor) {
    return Column(
      children: [
        ..._displayedProjects
            .map((project) => buildProjectWidget(project, scaleFactor))
            .toList(),
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
              width: 42.46 * scaleFactor,
              height: 239 * scaleFactor,
              decoration: BoxDecoration(color: Colors.white),
            ),
          ),
          Positioned(
            left: 580.58 * scaleFactor,
            top: 52 * scaleFactor,
            child: Container(
              width: 60.15 * scaleFactor,
              height: 71 * scaleFactor,
              decoration: BoxDecoration(color: Colors.white),
            ),
          ),
          Positioned(
            left: 581.61 * scaleFactor,
            top: 121 * scaleFactor,
            child: Container(
              width: 990.56 * scaleFactor,
              height: 559 * scaleFactor,
              decoration: BoxDecoration(color: Colors.white),
            ),
          ),
          Positioned(
            left: 595.11 * scaleFactor,
            top: 151 * scaleFactor,
            child: SizedBox(
              width: 608.21 * scaleFactor,
              height: 180 * scaleFactor,
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
            top: 320 * scaleFactor,
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
              height: 300 * scaleFactor,
              child: Stack(
                children: [
                  Positioned(
                    left: 0,
                    top: 0,
                    child: Container(
                      width: 960.15 * scaleFactor,
                      height: 101 * scaleFactor,
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
            left: 593.92 * scaleFactor,
            top: 566 * scaleFactor,
            child: Container(
              width: 650 * scaleFactor,
              child: Wrap(
                spacing: 8 * scaleFactor,
                runSpacing: 8 * scaleFactor,
                children: project.tags
                    .map((tag) => Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 12 * scaleFactor,
                            vertical: 6 * scaleFactor,
                          ),
                          decoration: ShapeDecoration(
                            color: Color(0xFFA7A7A7),
                            shape: RoundedRectangleBorder(
                              borderRadius:
                                  BorderRadius.circular(8 * scaleFactor),
                            ),
                          ),
                          child: Text(
                            tag,
                            textAlign: TextAlign.center,
                            style: GoogleFonts.roboto(
                              textStyle: TextStyle(
                                color: Color(0xFFA92756),
                                fontSize: 16 * scaleFactor,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ))
                    .toList(),
              ),
            ),
          ),
          Positioned(
            left: 591.92 * scaleFactor,
            top: 520 * scaleFactor,
            child: Container(
              padding: EdgeInsets.symmetric(
                horizontal: 12 * scaleFactor,
                vertical: 6 * scaleFactor,
              ),
              decoration: ShapeDecoration(
                color: Color(0xFBB7BA7A7),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8 * scaleFactor),
                ),
              ),
              child: Text(
                project.status,
                textAlign: TextAlign.center,
                style: GoogleFonts.roboto(
                  textStyle: TextStyle(
                    color: Color(0xFFA92756),
                    fontSize: 16 * scaleFactor,
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
