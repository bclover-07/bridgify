const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, 'lib', 'features');

const features = {
    'faculty': [
        'Notes', 'PPT Maker', 'Dropout Radar', 'Cohort Heatmap', 
        'Lecture Bridge', 'Mentorship', 'Learning Feed', 'Assessments'
    ],
    'admin': [
        'Student Directory', 'Placement CC', 'NAAC Report', 'Skill Ledger', 'Analytics'
    ],
    'recruiter': [
        'Candidate Search', 'PS Generator', 'Marketplace', 'Pipeline', 'Fair Hiring', 'Feedback'
    ]
};

function toSnakeCase(name) {
    return name.toLowerCase().replace(/ /g, '_');
}

function toCamelCase(name) {
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

const template = `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/neu_theme.dart';
import '../../../core/theme/neu_components.dart';
import '../../../core/network/api_client.dart';

class {ClassName}Screen extends ConsumerStatefulWidget {
  const {ClassName}Screen({super.key});

  @override
  ConsumerState<{ClassName}Screen> createState() => _{ClassName}ScreenState();
}

class _{ClassName}ScreenState extends ConsumerState<{ClassName}Screen> {
  bool isLoading = true;
  List<dynamic> data = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      // Automatically routed offline request via ApiClient's interceptor
      final response = await ApiClient.instance.get('/api/{role}/{endpoint}');
      setState(() {
        data = response.data['data'] ?? [];
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('{Title}'),
        backgroundColor: NeuTheme.electric,
        foregroundColor: Colors.white,
      ),
      body: isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: data.length == 0 ? 1 : data.length,
            itemBuilder: (context, index) {
              if (data.length == 0) {
                return const Center(child: Text('No data found from backend'));
              }
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: NeuCard(
                  child: Text(data[index].toString()),
                ),
              );
            },
          ),
    );
  }
}
`;

for (const [role, screens] of Object.entries(features)) {
    const roleDir = path.join(BASE_DIR, role, 'screens');
    fs.mkdirSync(roleDir, { recursive: true });
    
    for (const screen of screens) {
        const className = toCamelCase(screen);
        const fileName = `${toSnakeCase(screen)}_screen.dart`;
        const endpoint = toSnakeCase(screen);
        
        let content = template.replace(/{ClassName}/g, className)
                              .replace(/{Title}/g, screen)
                              .replace(/{role}/g, role)
                              .replace(/{endpoint}/g, endpoint);
                              
        fs.writeFileSync(path.join(roleDir, fileName), content);
    }
}

console.log("Scaffolding complete.");
