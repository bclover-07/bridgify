import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/neu_theme.dart';
import 'package:easy_localization/easy_localization.dart';

class AdminLayout extends StatefulWidget {
  final Widget child;
  const AdminLayout({super.key, required this.child});

  @override
  State<AdminLayout> createState() => _AdminLayoutState();
}

class _AdminLayoutState extends State<AdminLayout> {
  int _currentIndex = 0;
  final List<String> _routes = ['/admin', '/admin/student_directory', '/admin/placement_cc', '/admin/naac_report'];

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
        selectedItemColor: NeuTheme.orange,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Directory'),
          BottomNavigationBarItem(icon: Icon(Icons.work), label: 'Placement'),
          BottomNavigationBarItem(icon: Icon(Icons.analytics), label: 'NAAC'),
        ],
      ),
    );
  }
}
