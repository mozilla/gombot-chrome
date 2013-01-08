#!/usr/bin/ruby

output = "// AUTOGENERATED FILE: edit 'site_configs.yml' instead and run 'build_site_configs.rb'\n"
output += "var SiteConfigs = "+`js-yaml -j #{Dir.pwd+"/background/site_configs.yml"}`.gsub(/\n/,"")+";"
File.open(Dir.pwd+"/background/site_configs.js", 'w') {|f| f.write(output) }