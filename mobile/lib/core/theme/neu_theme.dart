import 'package:flutter/material.dart';

class NeuTheme {
  // The 13 Core Colors mapped from the web
  static const Color ink = Color(0xFF14121F);
  static const Color paper = Color(0xFFFBF6EC);
  static const Color electric = Color(0xFF4B3AFF);
  static const Color acid = Color(0xFFE8FF3D);
  static const Color coral = Color(0xFFFF5A4E);
  static const Color mint = Color(0xFF2FE3A3);
  static const Color sky = Color(0xFF3AC1FF);
  static const Color violet = Color(0xFFA960FF);
  static const Color hotpink = Color(0xFFFF3D9A);
  static const Color amber = Color(0xFFFFB020);
  static const Color lime = Color(0xFFA5FF33);
  static const Color cyan = Color(0xFF00FFFF);
  static const Color orange = Color(0xFFFF6600);

  // Border & Shadows
  static const double borderWidth = 3.0; // Slightly smaller for mobile
  static const double radiusCard = 20.0;
  static const double radiusButton = 14.0;
  static const double radiusInput = 14.0;
  
  static const Offset shadowOffset = Offset(6, 6);
  static const Offset shadowOffsetSm = Offset(4, 4);

  static ThemeData get themeData {
    return ThemeData(
      scaffoldBackgroundColor: paper,
      primaryColor: electric,
      fontFamily: 'SpaceGrotesk', // We will load GoogleFonts later
      colorScheme: const ColorScheme.light(
        primary: electric,
        secondary: hotpink,
        surface: paper,
        error: coral,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: ink,
        onError: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: paper,
        foregroundColor: ink,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: ink),
        titleTextStyle: TextStyle(color: ink, fontSize: 20, fontWeight: FontWeight.bold),
      ),
    );
  }
}
