use log::info;
use regex::Regex;

use crate::fs_io::{error::{FilesystemIOError, FilesystemIOErrorCode}, types::FsIoBatchEntity};


#[tauri::command]
pub fn preview_batch_rename(items: Vec<String>, pattern: String) -> Result<Vec<FsIoBatchEntity>, FilesystemIOError> {
    let sub_pattern = substitution_pattern_split(pattern)?;

    let expr = regex_from_expr(&sub_pattern.search)?;

    let mut response = Vec::<FsIoBatchEntity>::new();
    items.iter().for_each(|i| {
        response.push(FsIoBatchEntity { 
            original: i.clone(),
            target: run_regex(&expr, &i, &sub_pattern.replace),
        })
    });

    Ok(response)
}

/// checks for search and replace pattern with optional flag: s/search/replace[/flag]
pub fn substitution_pattern_split(pattern: String) -> Result<SearchAndReplace, FilesystemIOError> {
    if !pattern.starts_with("s/") {
        return Err(FilesystemIOError::from(
            FilesystemIOErrorCode::RegexSubstitutionMissingSeparators))
    }

    if pattern.len() < 4 {
        return Err(FilesystemIOError::from(
            FilesystemIOErrorCode::RegexSubstitutionMinimumLength))
    }

    let mut c = 2;
    let mut separators = Vec::<usize>::new();

    while c < pattern.len()-1 {
        if &pattern[c..c+1] == "\\" {
            c += 2;
            continue;
        }
        else if &pattern[c..c+1] == "/" {
            separators.push(c);
        }

        c += 1;
    }

    if separators.len() == 0 {
        return Err(FilesystemIOError::from(
            FilesystemIOErrorCode::RegexSubstitutionMissingSeparators))
    }

    if separators.len() > 2 {
        return Err(FilesystemIOError::from(
            FilesystemIOErrorCode::RegexSubstitutionTooManySeparators))
    }

    if separators.len() == 2 {
        Ok(SearchAndReplace {
            search: pattern[2..separators[0]].to_string(),
            replace: pattern[separators[0]+1..separators[1]].to_string(),
            flag: Some(pattern[separators[1]+1..].to_string()),
        })
    }
    else {
        Ok(SearchAndReplace {
            search: pattern[2..separators[0]].to_string(),
            replace: substitute_empty_replace(&pattern[separators[0]+1..]).to_string(),
            flag: None,
        })

    }
}

fn substitute_empty_replace(replace: &str) -> &str {
    // handles edge case of s/foo//, which is not counted as having two separators due to how the
    // string is walked. does not apply if a flag is set, which is counted as having two
    // separators: s/foo//g
    if replace == "/" {
        ""
    }
    else {
        replace
    }
}

pub struct SearchAndReplace {
    pub search: String,
    pub replace: String,
    pub flag: Option<String>,
}

pub fn regex_from_expr(expr: &String) -> Result<Regex, FilesystemIOError> {
    Regex::new(expr)
        .map_err(|e| {
            FilesystemIOError::with_details(
                FilesystemIOErrorCode::RegexInvalidExpr,
                e.to_string())
        })
        .and_then(|r| Ok(r) )
}

pub fn run_regex(expr: &Regex, haystack: &String, rep: &String) -> String {
    let s = expr.replace(&haystack, rep);
    s.to_string()
}
