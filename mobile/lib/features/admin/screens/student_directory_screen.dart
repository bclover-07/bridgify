import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class StudentDirectoryScreen extends ConsumerStatefulWidget {
  const StudentDirectoryScreen({super.key});

  @override
  ConsumerState<StudentDirectoryScreen> createState() => _StudentDirectoryScreenState();
}

class _StudentDirectoryScreenState extends ConsumerState<StudentDirectoryScreen> {
  bool isLoading = true;
  List<dynamic> allStudents = [];
  List<dynamic> filteredStudents = [];
  final TextEditingController _searchController = TextEditingController();
  int _currentPage = 0;
  final int _rowsPerPage = 10;

  @override
  void initState() {
    super.initState();
    _fetchStudents();
    _searchController.addListener(_onSearch);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchStudents() async {
    try {
      final response = await ApiClient.instance.get('/api/admin/students');
      setState(() {
        allStudents = response.data['data'] ?? [];
        filteredStudents = List.from(allStudents);
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        allStudents = List.generate(25, (index) => {
          "id": "S10${index + 1}",
          "name": "Student ${index + 1}",
          "branch": index % 2 == 0 ? "Computer Science" : "Electronics",
          "year": "3rd Year",
          "cgpa": (7.0 + (index % 3)).toStringAsFixed(1),
        });
        filteredStudents = List.from(allStudents);
        isLoading = false;
      });
    }
  }

  void _onSearch() {
    final q = _searchController.text.toLowerCase();
    setState(() {
      filteredStudents = allStudents.where((s) {
        return s['name'].toString().toLowerCase().contains(q) ||
               s['id'].toString().toLowerCase().contains(q) ||
               s['branch'].toString().toLowerCase().contains(q);
      }).toList();
      _currentPage = 0;
    });
  }

  void _showStudentModal(Map<String, dynamic> student) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: NeuTheme.paper,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: NeuTheme.ink, width: NeuTheme.borderWidth),
          borderRadius: BorderRadius.circular(0),
        ),
        title: Text(student['name'], style: const TextStyle(fontWeight: FontWeight.w900)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ID: ${student['id']}'),
            const SizedBox(height: 8),
            Text('Branch: ${student['branch']}'),
            const SizedBox(height: 8),
            Text('Year: ${student['year']}'),
            const SizedBox(height: 8),
            Text('CGPA: ${student['cgpa']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          ],
        ),
        actions: [
          NeuButton(
            text: 'Close',
            color: NeuTheme.sky,
            onPressed: () => Navigator.pop(context),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final int totalPages = (filteredStudents.length / _rowsPerPage).ceil();
    final int startIndex = _currentPage * _rowsPerPage;
    final int endIndex = (startIndex + _rowsPerPage > filteredStudents.length) 
        ? filteredStudents.length 
        : startIndex + _rowsPerPage;
    
    final currentStudents = filteredStudents.sublist(
      startIndex, 
      endIndex,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Directory'),
        backgroundColor: NeuTheme.sky,
        foregroundColor: NeuTheme.ink,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            NeuInput(
              controller: _searchController,
              hintText: 'Search by Name, ID, or Branch...',
            ),
            const SizedBox(height: 16),
            Expanded(
              child: isLoading
                ? const Center(child: CircularProgressIndicator(color: NeuTheme.sky))
                : NeuCard(
                    backgroundColor: Colors.white,
                    child: Column(
                      children: [
                        Expanded(
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: DataTable(
                              headingRowColor: MaterialStateProperty.all(NeuTheme.sky),
                              columns: const [
                                DataColumn(label: Text('ID', style: TextStyle(fontWeight: FontWeight.bold))),
                                DataColumn(label: Text('Name', style: TextStyle(fontWeight: FontWeight.bold))),
                                DataColumn(label: Text('Branch', style: TextStyle(fontWeight: FontWeight.bold))),
                                DataColumn(label: Text('CGPA', style: TextStyle(fontWeight: FontWeight.bold))),
                                DataColumn(label: Text('Action', style: TextStyle(fontWeight: FontWeight.bold))),
                              ],
                              rows: currentStudents.map((s) => DataRow(
                                cells: [
                                  DataCell(Text(s['id'])),
                                  DataCell(Text(s['name'])),
                                  DataCell(Text(s['branch'])),
                                  DataCell(Text(s['cgpa'], style: const TextStyle(fontWeight: FontWeight.bold))),
                                  DataCell(
                                    IconButton(
                                      icon: const Icon(Icons.visibility),
                                      onPressed: () => _showStudentModal(s),
                                    )
                                  ),
                                ]
                              )).toList(),
                            ),
                          ),
                        ),
                        if (totalPages > 1)
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.arrow_back),
                                  onPressed: _currentPage > 0 ? () => setState(() => _currentPage--) : null,
                                ),
                                Text('Page ${_currentPage + 1} of $totalPages'),
                                IconButton(
                                  icon: const Icon(Icons.arrow_forward),
                                  onPressed: _currentPage < totalPages - 1 ? () => setState(() => _currentPage++) : null,
                                ),
                              ],
                            ),
                          )
                      ],
                    ),
                  ),
            )
          ],
        ),
      ),
    );
  }
}
