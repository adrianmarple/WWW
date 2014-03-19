function [img, alpha] = alphize(img, mode)

alpha = ones(size(img,1),size(img,2));

for x = 1:size(img,1)
    for y = 1:size(img,2)
        r = img(x,y,1);
        g = img(x,y,2);
        b = img(x,y,3);
        if(mode == 1)
            if(r == 255 && g == 255 && b == 255)
                alpha(x,y) = 0;
            end
        end
        if(mode == 2)
            if(r == g && g == b)
                alpha(x,y) = r/255.0;
                img(x,y,:) = [0,0,0];
            end
        end
        if(mode == 3)
            alpha(x,y) = (r+g+b)/765.0;
            img(x,y,:) = [0,0,0];
        end
    end
end