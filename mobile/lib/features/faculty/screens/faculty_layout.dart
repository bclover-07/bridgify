import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/neu_theme.dart';
import 'package:easy_localization/easy_localization.dart';

class FacultyLayout extends StatefulWidget {
  final Widget child;
  const FacultyLayout({super.key, required this.child});

  @override
  State<FacultyLayout> createState() => _FacultyLayoutState();
}

class _FacultyLayoutState extends State<FacultyLayout> {
  int _currentIndex = 0;
  final List<String> _routes = ['/faculty/notes', '/faculty/ppt_maker', '/faculty/dropout_radar'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() => _currentIndex = index);
          context.go(_routes[index]);
        },
        selectedItemColor: NeuTheme.violet,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.note), label: 'Notes'),
          BottomNavigationBarItem(icon: Icon(Icons.slideshow), label: 'PPT'),
          BottomNavigationBarItem(icon: Icon(Icons.radar), label: 'Radar'),
        ],
      ),
    );
  }
}
