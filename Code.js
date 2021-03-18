/*
    OPTIONS
*/
var clockifyWorkspaceId = '';
var clockifyApiKey = '';

var ui = SpreadsheetApp.getUi(); // Same variations.
var ss = SpreadsheetApp.getActiveSpreadsheet();

var tabs = {
  eventsEntries: {
    name: 'Events/Entries',
    bookmarks: {
      downloadRange: 'B2',
      entries: {start: 'A4', startRow: 4, startCol: 'A', cols: 14},
      descriptions: 'D4',
      project: {startRow: 4, startCol: 'E', cols: 1},
      task: {start: 'G4', startRow: 4, startCol: 'G', cols: 1},
      tag1: {startRow: 4, startCol: 'I', cols: 1},
      tag2: {startRow: 4, startCol: 'K', cols: 1},
      tag3: {startRow: 4, startCol: 'M', cols: 1}
    },
    clearEntries: function() {
      var ee = tabs.eventsEntries;
      var startCell = ee.bookmarks.entries.start;
      var endCol = utils.newColAlpha(ee.bookmarks.entries.startCol, ee.bookmarks.entries.cols);
      var endRow = ss.getSheetByName(ee.name).getMaxRows();
      var rangeName = ee.name+'!'+startCell+':'+endCol+endRow;
      ss.getRange(rangeName).clearContent();

      rangeName = ee.name+'!'+ee.bookmarks.task.start+':'+ee.bookmarks.task.startCol+endRow;
      ss.getRange(rangeName).clearDataValidations();
    },
    fillEntries: function(values) {
      if(!values || values.length == 0) return;
      var ee = tabs.eventsEntries;
      var startRow = ee.bookmarks.entries.startRow;
      var endRow = startRow + values.length;
      var startCell = ee.bookmarks.entries.startCol+ee.bookmarks.entries.startRow;
      var rangeName = ee.name+'!'+startCell+':D'+(endRow-1);
      ss.getRange(rangeName).setValues(values);
    },
    applyProjectTaskAndTagsToEntry: function(entry, rule){
      row = entry.i+tabs.eventsEntries.bookmarks.entries.startRow;
      tabName = tabs.eventsEntries.name;

      var clearValue = '(clear)';

      // apply project
      if (rule.project) {
        if (rule.project == clearValue) {
          rule.project = '';
          rule.projectId = '';
        }
        col = tabs.eventsEntries.bookmarks.project.startCol;
        ss.getRange(tabName+'!'+col+row).setValue(rule.project);
        col = utils.newColAlpha(col,2);
        ss.getRange(tabName+'!'+col+row).setValue(rule.projectId);
      }

      // apply task
      if (rule.task) {
        if (rule.task == clearValue) {
          rule.task = '';
          rule.taskId = '';
        }
        col = tabs.eventsEntries.bookmarks.task.startCol;
        ss.getRange(tabName+'!'+col+row).setValue(rule.task);
        col = utils.newColAlpha(col,2);
        ss.getRange(tabName+'!'+col+row).setValue(rule.taskId);
        
        // TODO: set validation on Task
      }

      // apply tag 1
      if (rule.tag1) {
        if (rule.tag1 == clearValue) {
          rule.tag1 = '';
          rule.tag1Id = '';
        }
        col = tabs.eventsEntries.bookmarks.tag1.startCol;
        ss.getRange(tabName+'!'+col+row).setValue(rule.tag1);
        col = utils.newColAlpha(col,2);
        ss.getRange(tabName+'!'+col+row).setValue(rule.tag1Id);
      }

      // apply tag 2
      if (rule.tag2) {
        if (rule.tag2 == clearValue) {
          rule.tag2 = '';
          rule.tag2Id = '';
        }
        col = tabs.eventsEntries.bookmarks.tag2.startCol;
        ss.getRange(tabName+'!'+col+row).setValue(rule.tag2);
        col = utils.newColAlpha(col,2);
        ss.getRange(tabName+'!'+col+row).setValue(rule.tag2Id);
      }

      // apply tag 3
      if (rule.tag3) {
        if (rule.tag3 == clearValue) {
          rule.tag3 = '';
          rule.tag3Id = '';
        }
        col = tabs.eventsEntries.bookmarks.tag3.startCol;
        ss.getRange(tabName+'!'+col+row).setValue(rule.tag3);
        col = utils.newColAlpha(col,2);
        ss.getRange(tabName+'!'+col+row).setValue(rule.tag3Id);
      }
    },
    get: {
      obj: {
        entry: function(cellValues) {
          return {date: cellValues[0], startTime: cellValues[1], endTime: cellValues[2], description: cellValues[3], project: cellValues[4], projectId: cellValues[5], task: cellValues[6], taskId: cellValues[7], tag1: cellValues[8], tag1Id: cellValues[9], tag2: cellValues[10], tag2Id: cellValues[11], tag3: cellValues[12], tag3Id: cellValues[13]  };
        }
      },
      entries: function() {
        var entries = utils.getRangeValues(tabs.eventsEntries.name, tabs.eventsEntries.bookmarks.entries);
        var entryObjects = Array();
        for(var i = 0; i < entries.length; i++) {
          e = tabs.eventsEntries.get.obj.entry(entries[i]);
          e.i = i;
          entryObjects.push(e);
        }
        return entryObjects;
      }
    }
  },
  metaData: {
    name: 'Metadata',
    bookmarks: {
      projects: {start: 'A3', startCol: 'A', startRow: 3, cols: 2},
      tasks: {start: 'C3', startCol: 'C', startRow: 3, cols: 3},
      tags: {start: 'F3', startCol: 'F', startRow: 3, cols: 2},
      dateRanges: {start: 'I3', startCol: 'I', startRow: 3, cols: 1},
      comparators: {start: 'J3', cols: 1},
    },
    clearList: function(bookmark) {
      var startCol = bookmark.start.replace( /^\d+/g, ''); // strip digits
      var listEnd = utils.newColAlpha(startCol, bookmark.cols) + '100';
      var rangeName = tabs.metaData.name+'!'+bookmark.start+':'+listEnd;
      // Logger.log(rangeName);
      ss.getRangeByName(rangeName).clearContent();
    },
    fillList: function(bookmark, cellValues) {

      var cols = cellValues[0].length;
      var rows = cellValues.length;

      var endRow = (rows + parseInt(bookmark.startRow) - 1);
      var endCol = utils.newColAlpha(bookmark.startCol, cols);
      var listEnd = endCol+endRow;

      var sheet = ss.getSheetByName(tabs.metaData.name);
      var maxRows = sheet.getMaxRows();
      var newRows = endRow - maxRows;
      if (newRows > 0) {
        sheet.insertRows(maxRows, newRows+5);
      }

      var rangeName = tabs.metaData.name+'!'+bookmark.start+':'+listEnd;
      ss.getRange(rangeName).setValues(cellValues);
    },
    get: {
      obj: {
        project: function(cellValues) {
          return {id: cellValues[0], name: cellValues[1]}
        },
        task: function(cellValues) {
          return {id: cellValues[0], name: cellValues[1], projectId: cellValues[2]}
        },
        tag: function(cellValues) {
          return {id: cellValues[0], name: cellValues[1]}
        }
      },
      projects: function() {
        var projects = utils.getRangeValues(tabs.metaData.name, tabs.metaData.bookmarks.projects);
        var projectObjects = Array();
        for (var i = 0; i < projects.length; i++) {
          projectObjects.push(tabs.metaData.get.obj.project(projects[i]));
        }
        return projectObjects;
      },
      project: function(projectName) {
        var projects = utils.getRangeValues(tabs.metaData.name, tabs.metaData.bookmarks.projects);
        for (var i = 0; i < projects.length; i++) {
          p = tabs.metaData.get.obj.project(projects[i]);
          if (p.name == projectName) {
            return p;
          }
        }
        return false;
      },
      tasks: function() {
        var tasks = utils.getRangeValues(tabs.metaData.name, tabs.metaData.bookmarks.tasks);
        var taskObjects = Array();
        for (var i = 0; i < tasks.length; i++) {
          taskObjects.push(tabs.metaData.get.obj.task(tasks[i]));
        }
        return taskObjects;
      },
      task: function(projectName, taskName) {
        var project = tabs.metaData.get.project(projectName);
        var tasks = utils.getRangeValues(tabs.metaData.name, tabs.metaData.bookmarks.tasks);
        for (var i = 0; i < tasks.length; i++) {
          t = tabs.metaData.get.obj.task(tasks[i]);
          if (t.projectId == project.id && t.name == taskName) {
            return t;
          }
        }
        return false;
      },
      projectTasks: function(projectId) {
        var projectTasks = Array();
        var allTasks = tabs.metaData.get.tasks();
        for (var i = 0; i < allTasks.length; i++) {
          var task = allTasks[i];
          if (task.projectId == projectId) {
            projectTasks.push(task);
          }
        }
        return projectTasks;
      },
      tag: function(tagName) {
        var tags = utils.getRangeValues(tabs.metaData.name, tabs.metaData.bookmarks.tags);
        for (var i = 0; i < tags.length; i++) {
          t = tabs.metaData.get.obj.tag(tags[i]);
          if (t.name == tagName) {
            return t;
          }
        }
        return false;
      }
    }
  },
  rules: {
    name: 'Rules',
    bookmarks: {
      project: {start: 'E3', startRow: 3, startCol: 'E', cols: 1},
      task: {start: 'G3', startRow: 3, startCol: 'G', cols: 1},
      tag1: {start: 'I3', startRow: 3, startCol: 'I', cols: 1},
      tag2: {start: 'K3', startRow: 3, startCol: 'K', cols: 1},
      tag3: {start: 'M3', startRow: 3, startCol: 'M', cols: 1},
      rules: {start: 'B3', startRow: 3, startCol: 'B', cols: 13}
    },
    get: {
      obj: {
        rule: function(cellValues) {
          return {comparator: cellValues[0], searchText: cellValues[1], project: cellValues[3], projectId: cellValues[4], task: cellValues[5], taskId: cellValues[6], tag1: cellValues[7], tag1Id: cellValues[8], tag2: cellValues[9], tag2Id: cellValues[10], tag3: cellValues[11], tag3Id: cellValues[12]};
        }
      },
      rules: function() {
        var rules = utils.getRangeValues(tabs.rules.name, tabs.rules.bookmarks.rules);
        var ruleObjects = Array();
        for (var i = 0; i < rules.length; i++) {
          ruleObjects.push(tabs.rules.get.obj.rule(rules[i]));
        }
        return ruleObjects;
      }
    }
  }
};

var utils = {
  newColAlpha: function(startColAlpha, cols) {
    var startColCharCode = startColAlpha.charCodeAt(0);
    var newColAlpha = String.fromCharCode((startColCharCode+cols-1));
    return newColAlpha;
  },
  columnToLetter: function(column) {
    var temp, letter = '';
    while (column > 0)
    {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
  },
  letterToColumn: function(letter) {
    var column = 0, length = letter.length;
    for (var i = 0; i < length; i++)
    {
      column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column;
  },
  getRangeValues: function(tabName, ref) {
    rangeStart = ref.start;
    lastRowIndex = ss.getRange(tabName+'!'+ref.start+':'+ref.startCol).getValues().filter(String).length;
    endCol = utils.newColAlpha(ref.startCol,ref.cols);
    rangeEnd = endCol+(lastRowIndex+ref.startRow-1);
    rangeName = tabName+'!'+rangeStart+':'+rangeEnd;
    return ss.getRange(rangeName).getValues();
  }
};

var clockify = {
  apiUrlPrefix: 'https://api.clockify.me/api/v1',
  workspaceId: function() {
    if (!clockifyWorkspaceId) {
      result = ui.prompt('Enter Clockify Workspace ID', ui.ButtonSet.OK_CANCEL);
      if (result.getSelectedButton() == ui.Button.OK) {
        clockifyWorkspaceId = result.getResponseText();
      }
    }
    return clockifyWorkspaceId;
  },
  apiKey: function() {
    if (!clockifyApiKey) {
      result = ui.prompt('Enter Clockify API Key', ui.ButtonSet.OK_CANCEL);
      if (result.getSelectedButton() == ui.Button.OK) {
        clockifyApiKey = result.getResponseText();
      }
    }
    return clockifyApiKey;
  },
  endpointUrl: function(endpoint) {
    return clockify.apiUrlPrefix + endpoint.replace('{workspaceId}', clockify.workspaceId);
  },
  create: {
    timeEntry: function(data) {
      var url = clockify.endpointUrl('/workspaces/{workspaceId}/time-entries');
      var timeEntry = {
        "start": data.start, //2018-06-12T13:48:14.000Z
        "end": data.end, //2018-06-12T13:50:14.000Z
        //"billable": "true",
        "description": data.description, //Writing documentation
        "projectId": data.projectId, //5b1667790cb8797321f3d664
        "taskId": data.taskId, //5b1e6b160cb8793dd93ec120
        "tagIds": data.tagIds // ["5a7c5d2db079870147fra234", "5a7c5d2db079870147fra234"]
      };
      return clockify._post(url, JSON.stringify(timeEntry));
    }
  },
  get: {
    tags: function() {
      var tags = Array();
      var newTags = clockify._get(clockify.endpointUrl('/workspaces/{workspaceId}/tags?page-size=100'));
      var page = 1;
      while(newTags.length > 0) {
        page++;
        tags = tags.concat(newTags);
        newTags = clockify._get(clockify.endpointUrl('/workspaces/{workspaceId}/tags?page-size=100&page='+page));
        Utilities.sleep(50);
      }
      return tags;
    },
    projects: function() {
      var projects = Array();
      var newProjects = clockify._get(clockify.endpointUrl('/workspaces/{workspaceId}/projects?page-size=100'));
      var page = 1;
      while(newProjects.length > 0) {
        page++;
        projects = projects.concat(newProjects);
        newProjects = clockify._get(clockify.endpointUrl('/workspaces/{workspaceId}/projects?page-size=100&page='+page));
        Utilities.sleep(50);
      }
      return projects;
    },
    tasksForProject: function(projectId) {
      Utilities.sleep(50);
      return clockify._get(clockify.endpointUrl('/workspaces/{workspaceId}/projects/'+projectId+'/tasks'));
    },
    tasksForProjects: function(projects) {
      var tasks = clockify.forEachConcat(projects, function(project){
        var projectTasks = clockify.get.tasksForProject(project.id);
        Logger.log(projectTasks);
        return projectTasks;
      });
      return tasks;
    }
  },
  _post: function(url, data) {
    var options = {
      'method'      : 'post',
      'headers'     : {
        'X-Api-Key'   : clockify.apiKey(),
        'Content-Type': 'application/json',
      },
      'payload'     : data,
      'muteHttpExceptions': true
    };
    response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
  },
  _get: function(url, data) {
    var options = {
      'method' : 'get',
      'headers'     : {
        'X-Api-Key'   : clockify.apiKey(),
        'Content-Type': 'application/json',
      },
      'payload' : data
    };
    response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
  },
  forEach: function (items, fcn) {
    var ret = Array();
    Logger.log('looping through ' + items.length + ' items');
    for(var i = 0; i < items.length; i++) {
      ret.push(fcn(items[i]));
    }
    return ret;
  },
  forEachConcat: function(items, fcn) {
    var ret = Array();
    Logger.log('looping through ' + items.length + ' items');
    for(var i = 0; i < items.length; i++) {
      ret = ret.concat(fcn(items[i]));
    }
    return ret;
  }
};

function onOpen() {

  ui.createMenu('Time Entry Scripts')
      .addItem('[1] Download Events', 'gCalDownloadEvents')
      .addItem('[2] Apply Rules', 'applyRulesToEvents')
      .addItem('[3] Upload Time Entries', 'clockifyUploadEntries')
      .addSeparator()
       .addSubMenu(ui.createMenu('Setup')
         .addItem('[Clockify] Download Projects', 'clockifyDownloadProjects')
         .addItem('[Clockify] Download Tasks', 'clockifyDownloadTasks')
         .addItem('[Clockify] Download Tags', 'clockifyDownloadTags')
         )
      .addToUi();
}

/**
 * The event handler triggered when editing the spreadsheet.
 * @param {Event} e The onEdit event.
 */
function onEdit(e) {
  // Set a comment on the edited cell to indicate when it was changed.
  var range = e.range;
  // Assume that Events/Entries and Rules columns for project, task and tags match up
  if (range.getSheet().getName() == tabs.rules.name || range.getSheet().getName() == tabs.eventsEntries.name) {
    col = utils.columnToLetter(range.getColumn());
    row = range.getRow();
    var nextCell = ss.getRange(utils.newColAlpha(col, 2)+row);
    switch(col) {
      case tabs.rules.bookmarks.project.startCol:

        // handles on Task Name and Task ID for clearing
        var nextNextCell = ss.getRange(utils.newColAlpha(col, 3)+row);
        var nextNextNextCell = ss.getRange(utils.newColAlpha(col, 3)+row);
        
        if (e.value) {
          project = tabs.metaData.get.project(e.value);
          // set ID in next column
          if (project != false) {
            nextCell.setValue(project.id);
            // set validation options for Task name
            var projectTasks = tabs.metaData.get.projectTasks(project.id);
            var taskNames = Array();
            for(var i = 0; i < projectTasks.length; i++) {
              taskNames.push(projectTasks[i].name);
            }
            var rule = SpreadsheetApp.newDataValidation().requireValueInList(taskNames).build();
            nextNextCell.setDataValidation(rule);
          }
        } else {
          // value was deleted
          nextCell.setValue('');
          nextNextCell.clearDataValidations();
          nextNextNextCell.clearContent();
        }
        break;
      case tabs.rules.bookmarks.task.startCol:
        if (e.value) {
          // set ID in next column
          var projectName = ss.getRange(utils.newColAlpha(col, -1)+row).getValue();
          task = tabs.metaData.get.task(projectName, e.value);
          if (task != false) {
            nextCell.setValue(task.id);
          }
          Logger.log(task);
        } else {
          // value was deleted
          nextCell.setValue('');
        }
        break;
      case tabs.rules.bookmarks.tag1.startCol:
      case tabs.rules.bookmarks.tag2.startCol:
      case tabs.rules.bookmarks.tag3.startCol:
        if (e.value) {
          tag = tabs.metaData.get.tag(e.value);
          // set ID in next column
          if (tag != false) {
            nextCell.setValue(tag.id);
          }
        } else {
          // value was deleted
          nextCell.setValue('');
        }
        break;
    }

  }
}


var gCalDownloadEvents = function() {
  var times = getStartAndEndTimes();

  var events = Calendar.Events.list('primary', {timeMin: times.start, timeMax: times.end, singleEvents: true, orderBy: 'startTime'}).items;
  var filteredEvents = clockify.forEach(events, function(event) {
    if (event.status != 'cancelled') {
      return {name: event.summary, start: event.start.dateTime, end: event.end.dateTime};
    }
  });
  var filteredEvents = filteredEvents.filter(function (el) {
    return el != null;
  });
  
  var entries = clockify.forEach(filteredEvents, function(event) {
    var startTime = new Date(event.start);
    var date = "'"+startTime.getFullYear()+'-'+(startTime.getMonth()+1)+'-'+startTime.getDate();
    var endTime = new Date(event.end);
    startTime = "'"+startTime.getHours()+':'+(startTime.getMinutes()<10?'0':'')+startTime.getMinutes();
    endTime = "'"+endTime.getHours()+':'+(endTime.getMinutes()<10?'0':'')+endTime.getMinutes();
    return [date, startTime, endTime, event.name];
  });

  tabs.eventsEntries.clearEntries();
  tabs.eventsEntries.fillEntries(entries);

  applyRulesToEvents();
};

var applyRulesToEvents = function() {
  
  // get all entries
  var entries = tabs.eventsEntries.get.entries();

  // get all rules
  var rules = tabs.rules.get.rules();

  // loop through all entries
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    // loop through all rules, applying if they apply
    for (var j = 0; j < rules.length; j++) {
      var rule = rules[j];
      if (rule.comparator && rule.searchText) {
        var regx = null;
        switch (rule.comparator) {
          case 'Equals':
            regx = new RegExp('^'+rule.searchText+'$', 'i');
            break;
          case 'Contains':
            regx = new RegExp(rule.searchText, 'i');
            break;
          case 'Starts With':
            regx = new RegExp('^'+rule.searchText, 'i');
            break;
          case 'Ends With':
            regx = new RegExp(rule.searchText+'$', 'i');
            break;
        }

        if (regx.test(entry.description)) {
          tabs.eventsEntries.applyProjectTaskAndTagsToEntry(entry, rule);
        }

      }
    }
  }
};

var clockifyUploadEntries = function() {
  var entries = tabs.eventsEntries.get.entries();
  for (idx in entries) {
    entry = entries[idx];
    if (entry.projectId && entry.taskId && entry.tag1Id) {
      var tags = Array();
      if (entry.tag1Id) tags.push(entry.tag1Id);
      if (entry.tag2Id) tags.push(entry.tag2Id);
      if (entry.tag3Id) tags.push(entry.tag3Id);
      
      var startDateTime = new Date(entry.date);
      var startTime = entry.startTime.split(':');
      startDateTime.setHours(startTime[0]);
      startDateTime.setMinutes(startTime[1]);

      var endDateTime = new Date(entry.date);
      var endTime = entry.endTime.split(':');
      endDateTime.setHours(endTime[0]);
      endDateTime.setMinutes(endTime[1]);

      var entryFields = {
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        description: entry.description,
        projectId: entry.projectId,
        taskId: entry.taskId,
        tagIds: tags
      };
      clockify.create.timeEntry(entryFields);
    } else {
      Logger.log('Missing requisite data for: [' + entry.description + ']');
    }
  }

};

var clockifyDownloadProjects = function() {  
  var projects = clockify.forEach(clockify.get.projects(), function(project) {
    return [project.id,project.name];
  });
  tabs.metaData.clearList(tabs.metaData.bookmarks.projects);
  tabs.metaData.fillList(tabs.metaData.bookmarks.projects, projects)
};

var clockifyDownloadTasks = function() {  
  var allProjects = tabs.metaData.get.projects();
  var tasks = clockify.get.tasksForProjects(allProjects);
  var tasks = clockify.forEach(tasks, function(task) {
    return [task.id, task.name, task.projectId];
  });
  tabs.metaData.clearList(tabs.metaData.bookmarks.tasks);
  tabs.metaData.fillList(tabs.metaData.bookmarks.tasks, tasks)
};

var clockifyDownloadTags = function() {
  var tags = clockify.forEach(clockify.get.tags(), function(tag) {
    return [tag.id, tag.name];
  });
  tabs.metaData.clearList(tabs.metaData.bookmarks.tags);
  tabs.metaData.fillList(tabs.metaData.bookmarks.tags, tags);
};

var getStartAndEndTimes = function() {
  var ev = tabs.eventsEntries;
  var chosenDateRange = ss.getRangeByName(ev.name+'!'+ev.bookmarks.downloadRange).getValue();
  // default is today
  var today = new Date();
  var startDate = endDate = today;
  var dayOfWeek = today.getDay();
  if (dayOfWeek == 0) {
    dayOfWeek = 7;
  }
  switch(chosenDateRange) {
    case 'Yesterday':
      var yday = today.setDate(today.getDate() - 1);
      startDate = endDate = new Date(yday);
      break;
    case 'Sunday':
      // 0 - Sunday (15th)
      // 1 - Monday
      // 2 - Tuesday
      // 3 - Wednesday (18th)
      // 4 - Thursday
      // 5 - Friday (20th)
      // 6 - Saturday
      startDate = endDate = new Date(today.setDate(today.getDate()-today.getDay()));
      break;
    case 'Monday':
      startDate = endDate = new Date(today.setDate(today.getDate()-(dayOfWeek-1)));
      break;
    case 'Tuesday':
      startDate = endDate = new Date(today.setDate(today.getDate()-(dayOfWeek-2)));
      break;
    case 'Wednesday':
      startDate = endDate = new Date(today.setDate(today.getDate()-(dayOfWeek-3)));
      break;
    case 'Thursday':
      startDate = endDate = new Date(today.setDate(today.getDate()-(dayOfWeek-4)));
      break;
    case 'Friday':
      startDate = endDate = new Date(today.setDate(today.getDate()-(dayOfWeek-5)));
      break;
    case 'Saturday':
      startDate = endDate = new Date(today.setDate(today.getDate()-(dayOfWeek-6)));
      break;
    case 'This Week':
      // TODO: fill in
      break;
    case 'Last Week':
      // TODO: fill in
      break;
    case 'Today':
    default:
      // Today is already the default value
      break;
  }

  var startTime = new Date(startDate.setHours(0,0,0,0)).toISOString();
  var endTime = new Date(endDate.setHours(24,0,0,0)).toISOString();

  return {
    start: startTime,
    end: endTime
  };
};

