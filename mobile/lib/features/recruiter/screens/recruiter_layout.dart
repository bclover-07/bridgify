import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/neu_theme.dart';
import 'package:easy_localization/easy_localization.dart';

class RecruiterLayout extends StatefulWidget {
  final Widget child;
  const RecruiterLayout({super.key, required this.child});

  @override
  State<RecruiterLayout> createState() => _RecruiterLayoutState();
}

class _RecruiterLayoutState extends State<RecruiterLayout> {
  int _currentIndex = 0;
  final List<String> _routes = ['/recruiter/candidate_search', '/recruiter/pipeline', '/recruiter/fair_hiring'];

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
        selectedItemColor: NeuTheme.cyan,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(icon: Icon(Icons.view_kanban), label: 'Pipeline'),
          BottomNavigationBarItem(icon: Icon(Icons.balance), label: 'Fair Hiring'),
        ],
      ),
    );
  }
}
