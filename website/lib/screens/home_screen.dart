import 'package:flutter/material.dart';
import 'dart:math';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: LayoutBuilder(
          builder: (BuildContext context, BoxConstraints constraints) {
            double scaleFactor = min(constraints.maxWidth / 1440, 1.0);
            return Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: AssetImage('assets/images/home_bg.png'),
                  fit: BoxFit.cover,
                  alignment: Alignment.topCenter,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: EdgeInsets.only(
                      left: max(80 * scaleFactor, 20),
                      top: 120 * scaleFactor,
                      right: 20,
                    ),
                    child: Container(
                      width: min(829 * scaleFactor, constraints.maxWidth - 40),
                      height: 94 * scaleFactor,
                      child: Stack(
                        children: [
                          Positioned(
                            left: 0,
                            top: 0,
                            child: Text(
                              'THIAGO GONÇALVES',
                              style: TextStyle(
                                color: Color(0xFFFBFBFB),
                                fontSize: 54 * scaleFactor,
                                fontWeight: FontWeight.w800,
                                height: 1,
                                letterSpacing: 5.40 * scaleFactor,
                              ),
                            ),
                          ),
                          Positioned(
                            left: 0,
                            top: 66 * scaleFactor,
                            child: Opacity(
                              opacity: 0.90,
                              child: Text(
                                '2D ARTIST + 2D ANIMATOR + GAMEDEV + SOUND DESIGNER',
                                style: TextStyle(
                                  color: Color(0xFFFBFBFB),
                                  fontSize: 25 * scaleFactor,
                                  fontWeight: FontWeight.w600,
                                  height: 1,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    pading: EdgeInsets.only(
                      left: max(80 * scaleFactor, 20),
                      top: 60 * scaleFactor,
                    ),
                    child: Container(
                      width: 541 * scaleFactor,
                      height: 541 * scaleFactor,
                      decoration: ShapeDecoration(
                        image: DecorationImage(
                          image: AssetImage('assets/images/foto.png'),
                          fit: BoxFit.cover,
                        ),
                        shape: RoundedRectangleBorder(
                          side: BorderSide(
                              width: 10 * scaleFactor,
                              color: Color(0xFFEEEEEE)),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(
                      height: constraints.maxHeight > 8344
                          ? 8344 - (120 + 94 + 60 + 541) * scaleFactor
                          : constraints.maxHeight -
                              (120 + 94 + 60 + 541) * scaleFactor),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
