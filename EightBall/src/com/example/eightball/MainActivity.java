package com.example.eightball;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Random;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Bitmap.CompressFormat;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.os.SystemClock;
import android.text.TextPaint;
import android.util.Log;
import android.view.Display;
import android.view.Menu;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.View.OnLongClickListener;
import android.widget.ImageView;
import android.widget.Toast;

public class MainActivity extends Activity implements OnClickListener, OnLongClickListener {

	private static final String TAG = "Eight Ball";
	// The big bitmap
	private Bitmap bitmap;
	// Ball bitmap
	private Bitmap ball;
	// Face bitmap
	private Bitmap face;
	// The canvas for modifying the bitmap
	private Canvas canvas;
	// Screen width
	private int width;
	// Screen height
	private int height;
	// Possible answers
	private String[] answers;
	// Array of colors
	private int[] colors;
	// Image view where info will be displayed
	private ImageView view;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		
		super.onCreate(savedInstanceState);
		Log.d(TAG, "onCreate");
		
		// Initialize the answers and colors arrays
		initialize();
		
		// Get device dimensions for creating the bitmap
		Display display = getWindowManager().getDefaultDisplay();
		width = display.getWidth();
		height = display.getHeight();
		
		// Create the bitmap
		bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
		canvas = new Canvas(bitmap);
		
		// Generate a random color for background
		Random generator = new Random();
		int color = generator.nextInt(10);
		canvas.drawColor(colors[color]);
		
		// Create and insert the ball bitmap
		ball = BitmapFactory.decodeResource(getResources(), R.drawable.ball);
		canvas.drawBitmap(ball, width - ball.getWidth(), height - ball.getHeight(), null);
		
		// Draw text in the bitmap using canvas
		TextPaint tp = new TextPaint();
		tp.setTextSize(height / 15);
		tp.setColor(0xff000099);
		canvas.drawText("Magic Eight Ball", width / 10, height / 10, tp);
		
		// Draw a border
		drawBorder();
		
		// Include the bitmap to the view, and set it as the content view to be displayed
		view = new ImageView(this);
		view.setImageBitmap(bitmap);
		
		//The Activity implements OnClickListener and OnLongClickListener interfaces, so we set it as the listener for responding to events
		view.setOnClickListener(this);
		view.setOnLongClickListener(this);
		setContentView(view);
		Toast.makeText(getApplicationContext(),	"Ask a Yes/No question and click to get your answer", Toast.LENGTH_LONG).show();
	}

	// Draws a border for the bitmap
	private void drawBorder() {
		
		Paint paint = new Paint();
		paint.setColor(0xff000099);
		paint.setStrokeWidth(10);
		canvas.drawLine(0, 0, 0, height, paint);
		canvas.drawLine(0, height, width, height, paint);
		canvas.drawLine(width, height, width, 0, paint);
		canvas.drawLine(width, 0, 0, 0, paint);
	}

	// Creates the array with possible answers and colors
	private void initialize() {
		
		answers = new String[20];
		answers[0] = "It is certain";
		answers[1] = "It is decidedly so";
		answers[2] = "Without a doubt";
		answers[3] = "Yes definitely";
		answers[4] = "You may rely on it";
		answers[5] = "As I see it, yes";
		answers[6] = "Most likely";
		answers[7] = "Outlook good";
		answers[8] = "Yes";
		answers[9] = "Signs point to yes";
		answers[10] = "Reply hazy try again";
		answers[11] = "Ask again later";
		answers[12] = "Better not tell you now";
		answers[13] = "Cannot predict now";
		answers[14] = "Concentrate and ask again";
		answers[15] = "Don't count on it";
		answers[16] = "My reply is no";
		answers[17] = "My sources say no";
		answers[18] = "Outlook not so good";
		answers[19] = "Very doubtful";
		colors = new int[10];
		colors[0] = 0xFFFF6666;
		colors[1] = 0xFFCCFF66;
		colors[2] = 0xFFCC99CC;
		colors[3] = 0xFFCC0033;
		colors[4] = 0xFF99CCCC;
		colors[5] = 0xFF99CC33;
		colors[6] = 0xFF9933CC;
		colors[7] = 0xFF6699CC;
		colors[8] = 0xFF3399CC;
		colors[9] = 0xFFFF00AA;

	}
	
	//Responds to long click events
	@Override
	public boolean onLongClick(View v) {
		
		//Create the file using an stream
		File path = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES);
		path.mkdirs();
		String fileName = "Imagen" + SystemClock.currentThreadTimeMillis() + ".jpg";
		File file = new File(path, fileName);
		FileOutputStream stream;
		try {
			stream = new FileOutputStream(file);
			bitmap.compress(CompressFormat.JPEG, 100, stream);
			stream.close();
		} catch (FileNotFoundException e) {
			Log.e(TAG, "Error loading file", e);
			return false;
		} catch (IOException e) {
			Log.e(TAG, "Error reading file", e);
			return false;
		}
		//Makes an "auto-scan" in the device for being able to find the picture after creating it
		Uri uri = Uri.fromFile(file);
		Intent intent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
		intent.setData(uri);
		sendBroadcast(intent);

		//Creates an intent to share the resulting image, stored in the file
		Intent share = new Intent(Intent.ACTION_SEND);
		share.setType("image/jpeg");
		share.putExtra(Intent.EXTRA_STREAM, uri);
		startActivity(Intent.createChooser(share, "Share using"));
		return true;
	}

	//Responds to onClick events
	@Override
	public void onClick(View v) {
		
		// Create a random answer and color, load corresponding image
		Random generator = new Random();
		int answer = generator.nextInt(20);
		int color = generator.nextInt(10);
		
		// Clean previous bitmap
		if (face != null)
			face.recycle();
		bitmap.recycle();
		if (answer >= 0 && answer <= 9)
			face = BitmapFactory.decodeResource(getResources(),	R.drawable.happy);
		else if (answer >= 10 && answer <= 14)
			face = BitmapFactory.decodeResource(getResources(),	R.drawable.normal);
		else
			face = BitmapFactory.decodeResource(getResources(),	R.drawable.sad);

		// Create new bitmap with corresponding answer
		bitmap = Bitmap.createBitmap(width, height,	Bitmap.Config.ARGB_8888);
		canvas = new Canvas(bitmap);
		canvas.drawColor(colors[color]);
		canvas.drawBitmap(face, 10, 0, null);
		canvas.drawBitmap(ball, width - ball.getWidth(), height - ball.getHeight(), null);
		drawBorder();
		TextPaint tp = new TextPaint();
		tp.setTextSize(height / 20);
		tp.setColor(0xff000000);
		canvas.drawText(answers[answer], 10, 100 + face.getHeight(), tp);
		view.setImageBitmap(bitmap);
	}
	
	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.main, menu);
		return true;
	}

}
