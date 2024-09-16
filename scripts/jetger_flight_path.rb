# Proudly made by hand by Cephon Altera
# ~===================================~
#
#   This script is meant for generating the CSS animation
#   for the flying jetger on the website since CSS has no
#   random numbers


numbers = (0..95).to_a

positions = 25

start = "@keyframes Jetger {\n"

first_x = -1;
first_y = -1;

positions.times do |i|
    if i != 0
        percentage = ((100.0 / positions.to_f) * i.to_f).floor.to_i
        start << "  #{percentage}% {\n"
    else
        start << "  from {\n"
    end

    x = numbers.sample
    y = numbers.sample

    if i == 0
        first_x = x
        first_y = y
    end

    start << "    top: #{y}vh;\n"
    start << "    left: #{x}vw;\n"

    start << "  }\n"
end

start << "  100% {\n"
start << "    top: #{first_y}vh;\n"
start << "    left: #{first_x}vw;\n"
start << "  }\n"

start << "}\n"

puts start
